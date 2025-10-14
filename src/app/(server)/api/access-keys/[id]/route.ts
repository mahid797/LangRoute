import { NextResponse } from 'next/server';

import { AccessKeyService, authenticate, createErrorResponse, handleApiError } from '@services';

import { AccessKeyIdParamSchema, UpdateAccessKeySchema } from '@lib/validation';

/**
 * PATCH /api/access-keys/[id]
 *
 * Updates a specific access key owned by the authenticated user.
 * Allows updating name, revoked status, and expiration date.
 *
 * @param request - The HTTP request object containing update data.
 * @param context - Context containing the route parameters.
 * @returns JSON response with updated access key (safe shape with preview).
 * @throws ServiceError if the access key ID is invalid or update fails.
 */
export async function PATCH(
	request: Request,
	context: { params: Promise<{ id: string }> },
): Promise<Response> {
	try {
		const params = await context.params;
		// Validate path params (UUID in Zod v4 syntax)
		const parsed = AccessKeyIdParamSchema.safeParse(params);
		if (!parsed.success) {
			return createErrorResponse('Invalid access key ID', 422, undefined, parsed.error.issues);
		}

		const userId = await authenticate();
		const body = await request.json().catch(() => ({}));

		const patchParsed = UpdateAccessKeySchema.safeParse(body);
		if (!patchParsed.success) {
			return createErrorResponse('Validation failed', 422, undefined, patchParsed.error.issues);
		}

		const accessKey = await AccessKeyService.updateAccessKey({
			accessKeyId: parsed.data.id,
			userId,
			patch: patchParsed.data,
		});

		return NextResponse.json({ accessKey });
	} catch (error) {
		return handleApiError('access-keys-update', error);
	}
}

/**
 * DELETE /api/access-keys/[id]
 *
 * Deletes a specific access key owned by the authenticated user.
 *
 * @param _request - The HTTP request object (unused).
 * @param context  - Context containing the route parameters.
 * @returns A response with status 204 on successful deletion.
 * @throws ServiceError if the access key ID is invalid or the deletion fails.
 */
export async function DELETE(
	_request: Request,
	context: { params: Promise<{ id: string }> },
): Promise<Response> {
	try {
		const params = await context.params;
		// Validate path params (UUID in Zod v4 syntax)
		const parsed = AccessKeyIdParamSchema.safeParse(params);
		if (!parsed.success) {
			return createErrorResponse('Invalid access key ID', 422, undefined, parsed.error.issues);
		}

		const userId = await authenticate();

		await AccessKeyService.deleteAccessKey({
			accessKeyId: parsed.data.id,
			userId,
		});

		// No content on successful delete
		return new NextResponse(null, { status: 204 });
	} catch (error) {
		return handleApiError('access-keys-delete', error);
	}
}
