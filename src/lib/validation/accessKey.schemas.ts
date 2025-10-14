// src/lib/validation/accessKey.schemas.ts
import { z } from 'zod';

export const CreateAccessKeySchema = z.object({
	name: z.string().trim().min(1).max(100).optional(),
	description: z.string().trim().max(500).optional(),
});

export const AccessKeyIdParamSchema = z.object({
	id: z.uuid({ error: 'Invalid access key ID format' }),
});

export const UpdateAccessKeySchema = z.object({
	name: z.string().trim().min(1).max(100).optional(),
	description: z.string().trim().max(500).optional(),
	revoked: z.boolean().optional(),
	expiresAt: z.iso.datetime().nullable().optional(),
});

export type CreateAccessKeyData = z.infer<typeof CreateAccessKeySchema>;
export type AccessKeyIdParamData = z.infer<typeof AccessKeyIdParamSchema>;
export type UpdateAccessKeyData = z.infer<typeof UpdateAccessKeySchema>;
