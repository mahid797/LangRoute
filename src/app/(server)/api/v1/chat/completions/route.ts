import { NextResponse } from 'next/server';

import { CompletionsService, createErrorResponse, handleApiError } from '@services';

import { withAccessKey } from '@lib/middleware/accessKey';
import { CompletionRequestSchema } from '@lib/validation';

/**
 * POST /api/v1/chat/completions
 *
 * OpenAI-compatible chat completions endpoint (proxy).
 * Accepts OpenAI-formatted chat messages and returns AI-generated responses.
 * Forwards requests to the internal completions service.
 * Supports streaming and various completion parameters.
 *
 * @param request - HTTP request containing OpenAI-compatible completion data.
 * @returns JSON response with OpenAI-compatible completion or streamed response.
 */
export const POST = withAccessKey(async (request: Request, ctx): Promise<Response> => {
	try {
		const body = await request.json().catch(() => null);
		const parsed = CompletionRequestSchema.safeParse(body);

		if (!parsed.success) {
			return createErrorResponse('Validation failed', 422, undefined, parsed.error.issues);
		}

		const result = await CompletionsService.processCompletion(parsed.data, ctx.userId);
		return NextResponse.json(result);
	} catch (error) {
		return handleApiError('completions', error);
	}
});
