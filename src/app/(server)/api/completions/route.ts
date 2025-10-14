import { NextResponse } from 'next/server';

import { CompletionsService, createErrorResponse, handleApiError } from '@services';

import { withAccessKey } from '@lib/middleware/accessKey';
import { CompletionRequestSchema } from '@lib/validation';

/**
 * POST /api/completions
 *
 * Canonical completions endpoint (internal).
 * Accepts completion requests and returns AI-generated responses.
 * Supports streaming and various completion parameters.
 *
 * @param request - HTTP request containing completion data.
 * @returns JSON response with completion or streamed response.
 */
export const POST = withAccessKey(async (request: Request, ctx): Promise<Response> => {
	try {
		const body = await request.json().catch(() => null);
		const parsed = CompletionRequestSchema.safeParse(body);

		if (!parsed.success) {
			return createErrorResponse('Validation failed', 422, undefined, parsed.error.issues);
		}

		const response = await CompletionsService.processCompletion(parsed.data, ctx.userId);
		return NextResponse.json(response);
	} catch (error) {
		return handleApiError('completions', error);
	}
});
