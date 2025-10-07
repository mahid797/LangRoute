/**
 * Adapter base interfaces
 * Defines the contract for provider-specific LLM adapters
 */
import type { CompletionResult } from '@lib/models';
import type { CompletionRequest } from '@lib/validation';

/**
 * LLM adapter interface
 * All provider-specific LLM adapters must implement this interface
 */
export interface LlmAdapter {
	/**
	 * Process an LLM completion request and return a result
	 *
	 * @param req - The completion request
	 * @returns Promise resolving to completion result
	 */
	complete(req: CompletionRequest): Promise<CompletionResult>;
}
