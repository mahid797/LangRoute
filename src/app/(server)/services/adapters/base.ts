// src/app/(server)/services/adapters/base.ts
/**
 * Adapter base interfaces
 * Defines the contract for provider-specific LLM adapters
 */
import type { CompletionResult } from '@lib/models';
import type { CompletionRequest } from '@lib/validation';

/**
 * Payload returned by provider adapters.
 * Adapters should NOT set id/created/model; the service composes those.
 */
export interface AdapterCompletionPayload {
	choices: CompletionResult['choices'];
	usage: CompletionResult['usage'];
}

/**
 * LLM adapter interface
 * All provider-specific LLM adapters must implement this interface
 */
export interface LlmAdapter {
	/**
	 * Process an LLM completion request and return a provider-agnostic payload.
	 *
	 * @param req - The completion request
	 * @returns Promise resolving to completion payload (choices + usage only)
	 */
	complete(req: CompletionRequest): Promise<AdapterCompletionPayload>;
}
