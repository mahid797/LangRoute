/**
 * POST /api/v1/chat/completions
 *
 * OpenAI-compatible chat completions endpoint (proxy).
 * Re-exports from the canonical /api/completions endpoint to maintain DRY.
 * Accepts OpenAI-formatted chat messages and returns AI-generated responses.
 * Supports streaming and various completion parameters.
 */
export { POST } from '@/app/(server)/api/completions/route';
