import { NextResponse } from 'next/server';

import { AccessKeyService, authenticate, createErrorResponse, handleApiError } from '@services';

import { CreateAccessKeySchema } from '@lib/validation';

/**
 * GET /api/access-keys
 *
 * Retrieves all access keys for the authenticated user.
 * Returns an array of safe access key objects with preview (no full key).
 *
 * @returns JSON response with array of user's access keys
 */
export async function GET(): Promise<NextResponse> {
	try {
		const userId = await authenticate();
		const accessKeys = await AccessKeyService.getUserAccessKeys(userId);

		return NextResponse.json({ accessKeys });
	} catch (error) {
		return handleApiError('access-keys-get', error);
	}
}

/**
 * POST /api/access-keys
 *
 * Creates a new access key for the authenticated user.
 * Accepts optional name parameter for access key identification.
 *
 * @param request - HTTP request containing optional access key metadata
 * @returns JSON response with created access key details (includes full key one-time)
 */
export async function POST(request: Request): Promise<NextResponse> {
	try {
		const userId = await authenticate();
		const body = await request.json().catch(() => ({}));

		const parsed = CreateAccessKeySchema.safeParse(body);

		if (!parsed.success) {
			return createErrorResponse('Validation failed', 422, undefined, parsed.error.issues);
		}

		const accessKey = await AccessKeyService.createAccessKey({
			userId,
			...parsed.data,
		});

		return NextResponse.json({ accessKey }, { status: 201 });
	} catch (error) {
		return handleApiError('access-keys-create', error);
	}
}
