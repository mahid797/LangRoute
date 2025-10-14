// src/app/(server)/services/completions/service.ts
/**
 * Completions service for processing LLM completion requests.
 * Canonical internal implementation for completion processing and provider routing.
 */
import { randomUUID } from 'crypto';

import type { CompletionResult } from '@lib/models';
import type { CompletionRequest } from '@lib/validation';

import { getAdapterForProvider } from '../adapters/dispatch';
import { ModelConfigService } from '../models/service';
import { ServiceError } from '../system/errorService';

/**
 * Completions Service
 * Handles LLM completion processing and provider routing.
 */
export const CompletionsService = {
	/**
	 * Processes an LLM completion request.
	 *
	 * Responsibilities:
	 * - Validate model and enforce capability/limits from the model registry
	 * - Reject unsupported features (streaming) for now
	 * - Delegate to the provider adapter
	 * - Set canonical public `id` and `created` values (single source of truth)
	 *
	 * @param data - The completion request data.
	 * @param userId - The user ID making the request.
	 * @returns The completion response.
	 */
	async processCompletion(data: CompletionRequest, userId: string): Promise<CompletionResult> {
		// 1) Validate model and fetch config from the registry
		const modelConfig = ModelConfigService.validateAndGetModel(data.model);

		// 2) Enforce capabilities we currently support
		if (data.stream === true) {
			// Streaming is not implemented yet in Phase 1
			throw new ServiceError(
				'Streaming is not supported for this endpoint yet.',
				400,
				'BAD_REQUEST',
			);
		}

		// 3) Enforce model limits (max tokens)
		if (typeof data.max_tokens === 'number') {
			const reqMax = data.max_tokens;
			if (reqMax <= 0 || reqMax > modelConfig.maxTokens) {
				throw new ServiceError(
					`max_tokens exceeds model limit (requested ${reqMax}, max ${modelConfig.maxTokens}).`,
					400,
					'BAD_REQUEST',
				);
			}
		}

		// (Optional) Parameter defaults could be applied here if desired.
		// We keep Phase 1 strict: only enforce hard caps and leave omitted params unset.

		// 4) Route to the provider-specific adapter
		const adapter = getAdapterForProvider(modelConfig.provider);

		// The adapter returns only the body bits (choices, usage). We set id/created here.
		const { choices, usage } = await adapter.complete(data);

		// 5) Build canonical OpenAI-compatible response
		const response: CompletionResult = {
			id: `chatcmpl_lr_${randomUUID()}`, // canonical public id source
			object: 'chat.completion',
			created: Math.floor(Date.now() / 1000),
			model: data.model,
			choices,
			usage,
		};

		// NOTE: in future phases we’ll do request logging, usage accounting, etc., using userId + response metadata.
		void userId;

		return response;
	},
};
