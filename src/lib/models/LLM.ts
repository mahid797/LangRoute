/**
 * LLM domain models and interfaces
 * Core business entities for LLM functionality
 */
import type { ProviderId } from '@lib/config/modelRegistry';

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURATION INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Model configuration interface
 * Defines the structure for AI model metadata
 */
export interface ModelConfig {
	id: string;
	label: string;
	provider: ProviderId;
	description: string;
	contextWindow: number;
	maxTokens: number;
	supportsStreaming: boolean;
	supportsVision?: boolean;
	supportsFunctions?: boolean;
	pricing: {
		input: number; // per 1K tokens
		output: number; // per 1K tokens
	};
	deprecated?: boolean;
}

/**
 * Role configuration interface
 * Defines the structure for chat role metadata
 */
export interface RoleConfig {
	id: 'system' | 'user' | 'assistant' | (string & {}); // extensible
	label: string;
	description: string;
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPLETION INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Completion result interface (OpenAI-compatible)
 * Response format for chat completion requests
 */
export interface CompletionResult {
	id: string;
	object: 'chat.completion';
	created: number;
	model: string;
	choices: Array<{
		index: number;
		message: {
			role: 'assistant';
			content: string;
		};
		finish_reason: 'stop' | 'length' | 'content_filter';
	}>;
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
	};
}
