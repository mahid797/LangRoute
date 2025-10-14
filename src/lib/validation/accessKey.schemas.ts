// src/lib/validation/accessKey.schemas.ts
import { z } from 'zod';

export const CreateAccessKeySchema = z.object({
	name: z.string().trim().min(1).max(100).optional(),
});

/**
 * Validation schema for virtual key creation.
 * Includes alias, description, AI provider, and API key selection.
 */
export const CreateVirtualKeySchema = z.object({
	/** Alias/name for the virtual key */
	alias: z
		.string()
		.trim()
		.min(1, { message: 'Key name is required' })
		.max(100, { message: 'Key name must be less than 100 characters' }),
	/** Optional description of the virtual key */
	description: z
		.string()
		.trim()
		.max(500, { message: 'Description must be less than 500 characters' })
		.optional(),
	/** Selected AI provider */
	provider: z.string().min(1, { message: 'AI provider is required' }),
	/** API key of the selected provider */
	apiKey: z.string().min(1, { message: 'API key is required' }),
});

/**
 * Default values for virtual key creation form.
 */
export const createVirtualKeyDefaults = {
	alias: '',
	description: '',
	provider: '',
	apiKey: '',
} satisfies z.input<typeof CreateVirtualKeySchema>;

export const AccessKeyIdParamSchema = z.object({
	id: z.uuid({ error: 'Invalid access key ID format' }),
});

export const UpdateAccessKeySchema = z.object({
	name: z.string().trim().min(1).max(100).optional(),
	revoked: z.boolean().optional(),
	expiresAt: z.string().datetime().nullable().optional(),
});

export type CreateAccessKeyData = z.infer<typeof CreateAccessKeySchema>;
export type AccessKeyIdParamData = z.infer<typeof AccessKeyIdParamSchema>;
export type UpdateAccessKeyData = z.infer<typeof UpdateAccessKeySchema>;
export type CreateVirtualKeyData = z.infer<typeof CreateVirtualKeySchema>;
