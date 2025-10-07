// src/app/(server)/services/accessKey/service.ts
import { Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';

import { ServiceError } from '@services';

import prisma from '@/db/prisma';

/**
 * Data required to create a new access key.
 */
export interface CreateAccessKeyData {
	userId: string;
	name?: string;
}

/**
 * Response shape for access key creation.
 */
export interface AccessKeyResponse {
	id: string;
	key: string;
	createdAt: Date;
	name?: string | null;
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
	revoked?: boolean;
	/** ISO string or null (to clear). */
	expiresAt?: string | null;
}

/** Internal: consistent key prefix + preview logic. */
const KEY_PREFIX = 'lr_';
/**
 * Generates a secure access key with a consistent prefix.
 *
 * @returns A newly generated access key string.
 */
function generateKey(): string {
	return KEY_PREFIX + randomBytes(32).toString('hex');
}

/**
 * Formats an access key for display by showing a preview (prefix and last 4 characters).
 *
 * @param key - The access key to format.
 * @returns A formatted string preview of the access key.
 */
function previewFromKey(key: string): string {
	const last4 = key.slice(-4);
	return `${KEY_PREFIX}…${last4}`;
}

/** Shape returned when we don't want to expose the full key value again. */
export interface AccessKeySafe {
	id: string;
	name: string | null;
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
	key: string;
	name: string | null;
	revoked: boolean;
	expiresAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}): AccessKeySafe {
	return {
		id: row.id,
		name: row.name,
		revoked: row.revoked,
		expiresAt: row.expiresAt,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		preview: previewFromKey(row.key),
	};
}

/**
 * Access Key Service — business logic only.
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
				key: true,
				name: true,
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
		const { userId, name } = data;
		const key = generateKey();
		try {
			const accessKey = await prisma.accessKey.create({
				data: { key, userId, name },
				select: { id: true, key: true, createdAt: true, name: true },
			});
			return accessKey;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
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
				key: true,
				name: true,
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
				key: true,
				name: true,
				revoked: true,
				expiresAt: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return toSafeShape(updated);
	},

	/**
	 * Resolves user & key IDs from an access token.
	 *
	 * @param token - The access key token to resolve.
	 * @returns An object containing the user ID and key ID associated with the token.
	 */
	async getContextFromToken(token: string): Promise<{ userId: string; keyId: string }> {
		const rec = await prisma.accessKey.findUnique({
			where: { key: token },
			select: { id: true, userId: true, revoked: true, expiresAt: true },
		});

		if (!rec) throw new ServiceError('Unauthorized', 401);
		if (rec.revoked) throw new ServiceError('Access key revoked', 401);
		if (rec.expiresAt && rec.expiresAt < new Date())
			throw new ServiceError('Access key expired', 401);

		return { userId: rec.userId, keyId: rec.id };
	},
};
