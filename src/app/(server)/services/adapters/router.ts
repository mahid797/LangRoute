/**
 * Adapter router
 * Routes completion requests to provider-specific adapters
 */
import { type ProviderId, SUPPORTED_PROVIDERS } from '@lib/config/modelRegistry';
import type { CompletionResult } from '@lib/models';
import type { CompletionRequest } from '@lib/validation';

import { ServiceError } from '../system/errorService';
import type { LlmAdapter } from './base';

/**
 * Set of supported provider IDs for O(1) lookup
 */
const PROVIDERS = new Set(SUPPORTED_PROVIDERS);

/**
 * Mock adapter for development/testing
 * Returns a valid OpenAI-compatible completion result
 */
const mockAdapter: LlmAdapter = {
	async complete(req: CompletionRequest): Promise<CompletionResult> {
		return {
			id: `mock-${Date.now()}`,
			object: 'chat.completion',
			created: Math.floor(Date.now() / 1000),
			model: req.model,
			choices: [
				{
					index: 0,
					message: {
						role: 'assistant',
						content: `This is a mock response for model "${req.model}". Real provider adapters are not yet implemented.`,
					},
					finish_reason: 'stop',
				},
			],
			usage: {
				prompt_tokens: 10,
				completion_tokens: 20,
				total_tokens: 30,
			},
		};
	},
};

/**
 * Get the appropriate adapter for a given provider
 *
 * @param provider - The provider ID (e.g., 'openai', 'anthropic', 'google')
 * @returns LlmAdapter instance for the provider
 */
export function getAdapterForProvider(provider: ProviderId): LlmAdapter {
	// Validate provider is supported (Set-based O(1) lookup)
	if (!PROVIDERS.has(provider)) {
		throw new ServiceError(`Unsupported provider: ${provider}`, 400);
	}

	// For now, all providers use the mock adapter
	// TODO: Implement real provider-specific adapters:
	// - OpenAI adapter (src/app/(server)/services/adapters/openai.ts)
	// - Anthropic adapter (src/app/(server)/services/adapters/anthropic.ts)
	// - Google adapter (src/app/(server)/services/adapters/google.ts)
	return mockAdapter;
}
