// src/app/(server)/services/accessKey/service.ts
import { Prisma } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

import { ServiceError } from '@services';

import prisma from '@/db/prisma';

/**
 * Data required to create a new access key.
 */
export interface CreateAccessKeyData {
	userId: string;
	name?: string;
	description?: string;
}

/**
 * Response shape for access key creation.
 * Note: `key` (the plaintext secret) is only returned on creation, never again.
 */
export interface AccessKeyResponse {
	id: string;
	key: string;
	createdAt: Date;
	name?: string | null;
	description?: string | null;
}

/**
 * Data required to delete an access key.
 */
export interface DeleteAccessKeyData {
	accessKeyId: string;
	userId: string;
}

/**
 * Data required to update an access key.
 */
export interface UpdateAccessKeyData {
	accessKeyId: string;
	userId: string;
	patch: UpdateAccessKeyPatch;
}

/** PATCH input */
export interface UpdateAccessKeyPatch {
	name?: string;
	description?: string;
	revoked?: boolean;
	/** ISO string or null (to clear). */
	expiresAt?: string | null;
}

/** Internal: consistent key prefix + preview logic. */
const KEY_PREFIX = 'lr_';

/**
 * Generates a secure access key with a consistent prefix.
 *
 * @returns A newly generated access key string (plaintext secret).
 */
function generateKey(): string {
	return KEY_PREFIX + randomBytes(32).toString('hex');
}

/**
 * Compute a deterministic SHA-256 hex fingerprint for a plaintext key.
 * Used as a stable lookup id so we never store or query by plaintext.
 */
function sha256Hex(input: string): string {
	return createHash('sha256').update(input).digest('hex');
}

/**
 * Formats an access key for display by showing a preview (prefix and last 4 characters).
 * This is stored at creation time and reused later; full key is never returned again.
 *
 * @param key - The access key to format.
 * @returns A formatted string preview of the access key, e.g., "lr_…a1b2".
 */
function previewFromKey(key: string): string {
	const last4 = key.slice(-4);
	return `${KEY_PREFIX}…${last4}`;
}

/* ------------------------------------------------------------------ */
/*  Lazy argon2 import (Edge-friendly)                                */
/* ------------------------------------------------------------------ */

let _argon2: typeof import('argon2') | null = null;

/**
 * Lazily imports argon2 on first use.
 * This keeps the module Edge-compatible until hash/verify is actually called.
 *
 * @returns Promise resolving to argon2 module
 */
async function getArgon2(): Promise<typeof import('argon2')> {
	if (!_argon2) {
		_argon2 = await import('argon2');
	}
	return _argon2;
}

/** Shape returned when we don't want to expose the full key value again. */
export interface AccessKeySafe {
	id: string;
	name: string | null;
	description: string | null;
	revoked: boolean;
	expiresAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	preview: string; // e.g., lr_…abcd
}

/**
 * Converts a database row to a safe access key shape.
 *
 * @param row - The database row containing access key data.
 * @returns A safe access key shape with a preview.
 */
function toSafeShape(row: {
	id: string;
	preview: string;
	name: string | null;
	description: string | null;
	revoked: boolean;
	expiresAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}): AccessKeySafe {
	return {
		id: row.id,
		name: row.name,
		description: row.description,
		revoked: row.revoked,
		expiresAt: row.expiresAt,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		preview: row.preview,
	};
}

/**
 * Access Key Service — business logic only.
 * Implements secure creation (hash-at-rest), lookup by fingerprint, and safe reads.
 */
export const AccessKeyService = {
	/**
	 * Retrieves all access keys for a specific user.
	 *
	 * @param userId - The ID of the user whose access keys are to be retrieved.
	 * @returns An array of safe access key objects with preview (no full key).
	 */
	async getUserAccessKeys(userId: string): Promise<AccessKeySafe[]> {
		const accessKeys = await prisma.accessKey.findMany({
			where: { userId },
			select: {
				id: true,
				preview: true,
				name: true,
				description: true,
				revoked: true,
				expiresAt: true,
				createdAt: true,
				updatedAt: true,
			},
			orderBy: { createdAt: 'desc' },
		});
		return accessKeys.map(toSafeShape);
	},

	/**
	 * Creates a new access key for a user.
	 *
	 * @param data - The data required to create an access key, including user ID and optional name.
	 * @returns The created access key object with full key (one-time exposure).
	 */
	async createAccessKey(data: CreateAccessKeyData): Promise<AccessKeyResponse> {
		const { userId, name, description } = data;
		const key = generateKey(); // plaintext (one-time)
		const preview = previewFromKey(key);
		const keyId = sha256Hex(key);
		const argon2 = await getArgon2();
		const keyHash = await argon2.hash(key);

		try {
			const rec = await prisma.accessKey.create({
				data: {
					userId,
					name: name ?? null,
					description: description ?? null,
					keyId,
					keyHash,
					preview,
				},
				select: { id: true, createdAt: true, name: true, description: true },
			});

			// Return the plaintext key ONLY once, on creation
			return {
				id: rec.id,
				key,
				createdAt: rec.createdAt,
				name: rec.name,
				description: rec.description,
			};
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
				// Extremely unlikely unless a duplicate keyId (sha256) collision occurs
				throw new ServiceError('Access key already exists', 409);
			}
			throw error;
		}
	},

	/**
	 * Deletes an access key belonging to a specific user.
	 *
	 * @param data - The data required to delete an access key, including access key ID and user ID.
	 * @throws ServiceError if the access key does not exist or deletion fails.
	 */
	async deleteAccessKey(data: DeleteAccessKeyData): Promise<void> {
		const { accessKeyId, userId } = data;

		const accessKey = await prisma.accessKey.findFirst({
			where: { id: accessKeyId, userId },
			select: { id: true },
		});

		if (!accessKey) {
			throw new ServiceError('Access key not found or access denied', 404);
		}

		await prisma.accessKey.delete({ where: { id: accessKeyId } });
	},

	/**
	 * Updates selected fields on an access key (name, revoked, expiresAt).
	 *
	 * @param data - The data required to update an access key, including access key ID, user ID, and patch data.
	 * @returns A safe shape (no full key exposure) with a preview.
	 */
	async updateAccessKey({
		accessKeyId,
		userId,
		patch,
	}: UpdateAccessKeyData): Promise<AccessKeySafe> {
		// Ownership check + get current row
		const existing = await prisma.accessKey.findFirst({
			where: { id: accessKeyId, userId },
			select: {
				id: true,
				preview: true,
				name: true,
				description: true,
				revoked: true,
				expiresAt: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!existing) {
			throw new ServiceError('Access key not found or access denied', 404);
		}

		// Build update payload (narrow carefully)
		const data: Record<string, unknown> = {};
		if (patch.name !== undefined) data.name = patch.name ?? null;
		if (patch.description !== undefined) data.description = patch.description ?? null;
		if (patch.revoked !== undefined) data.revoked = Boolean(patch.revoked);

		const v = patch.expiresAt;
		if (v !== undefined) {
			if (v === null) {
				data.expiresAt = null; // clear
			} else {
				const d = new Date(v);
				if (Number.isNaN(d.getTime())) {
					throw new ServiceError('expiresAt must be an ISO-8601 date-time string or null', 400);
				}
				data.expiresAt = d;
			}
		}

		if (Object.keys(data).length === 0) {
			throw new ServiceError('No fields to update', 400);
		}

		const updated = await prisma.accessKey.update({
			where: { id: accessKeyId },
			data,
			select: {
				id: true,
				preview: true,
				name: true,
				description: true,
				revoked: true,
				expiresAt: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return toSafeShape(updated);
	},

	/**
	 * Resolves user & key IDs from a presented plaintext access key.
	 * Strategy: fingerprint (sha256) lookup, then Argon2 verify against stored hash.
	 *
	 * @param token - The presented plaintext access key (from Authorization header).
	 * @returns An object containing the user ID and key row ID associated with the token.
	 */
	async getContextFromToken(token: string): Promise<{ userId: string; keyId: string }> {
		// Lookup by deterministic fingerprint (never store or query by plaintext)
		const fingerprint = sha256Hex(token);
		const rec = await prisma.accessKey.findUnique({
			where: { keyId: fingerprint },
			select: { id: true, userId: true, keyHash: true, revoked: true, expiresAt: true },
		});

		// Do not reveal which part failed to avoid oracle behavior
		if (!rec) throw new ServiceError('Unauthorized', 401);

		// Verify the plaintext token against Argon2 hash
		const argon2 = await getArgon2();
		const ok = await argon2.verify(rec.keyHash, token);
		if (!ok) throw new ServiceError('Unauthorized', 401);

		// Policy checks
		if (rec.revoked) throw new ServiceError('Access key revoked', 401);
		if (rec.expiresAt && rec.expiresAt < new Date())
			throw new ServiceError('Access key expired', 401);

		// Best-effort update of lastUsedAt (non-blocking)
		prisma.accessKey
			.update({ where: { id: rec.id }, data: { lastUsedAt: new Date() } })
			.catch(() => {});

		return { userId: rec.userId, keyId: rec.id };
	},
};
