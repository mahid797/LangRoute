import { z } from 'zod';

export const CreateAiKeySchema = z.object({
	provider: z.enum([
		'gpt3.5-turbo',
		'gpt4',
		'gpt4o',
		'gpt4o-mini',
		'claude-2',
		'claude-instant-100k',
		'llama2-70b-chat',
		'llama3-70b-chat',
	]),
	apiKey: z.string().trim().min(1).max(100),
	aiKey: z.string().trim().min(1),
});

export const AiKeyIdParamSchema = z.object({
	id: z.uuid({ error: 'Invalid AI key ID format' }),
});

export type CreateAiKeyData = z.infer<typeof CreateAiKeySchema>;
export type AiKeyIdParamData = z.infer<typeof AiKeyIdParamSchema>;
