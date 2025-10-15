// src/lib/validation/accessKey.schemas.ts
import { z } from 'zod';

/**
 * ============================================================================
 * ZOD v4 SYNTAX GUIDE FOR AI AGENTS - TO BE REMOVED LATER
 * ============================================================================
 *
 * This file uses Zod v4.0.1 syntax. Key differences from v3:
 *
 * 1. ERROR MESSAGES:
 *    ✅ CORRECT (v4): z.uuid({ error: 'message' })
 *    ❌ WRONG (v3):   z.uuid({ message: 'message' })
 *    Note: Both work in v4, but `{ error }` is the primary syntax;
 *          `{ message }` is deprecated.
 *
 * 2. ISO DATETIME:
 *    ✅ CORRECT (v4): z.iso.datetime()
 *    ❌ WRONG (v3):   z.string().datetime()
 *    The new z.iso.* helpers are more explicit and type-safe.
 *
 * 3. STRICT OBJECTS:
 *    ✅ CORRECT (v4): z.strictObject({ ... })
 *    ✅ ALSO WORKS:   z.object({ ... }).strict()
 *    Strict objects reject unknown keys (better API security).
 *
 * 4. STRING VALIDATION:
 *    ✅ Shorthand:    z.string().min(1, 'Error message')
 *    ✅ Object form:  z.string().min(1, { error: 'Error message' })
 *
 * Official Zod v4 docs: https://zod.dev
 * ============================================================================
 */

/**
 * Schema for creating a new access key.
 */
export const CreateAccessKeySchema = z.strictObject({
	name: z.string().trim().min(1).max(100).optional(),
	description: z.string().trim().max(500).optional(),
});

/**
 * Schema for validating access key ID path parameters.
 */
export const AccessKeyIdParamSchema = z.strictObject({
	id: z.uuid({ error: 'Invalid access key ID format' }),
});

/**
 * Schema for updating an existing access key.
 */
export const UpdateAccessKeySchema = z.strictObject({
	name: z.string().trim().min(1).max(100).optional(),
	description: z.string().trim().max(500).optional(),
	revoked: z.boolean().optional(),
	expiresAt: z.iso.datetime().nullable().optional(),
});

export type CreateAccessKeyData = z.infer<typeof CreateAccessKeySchema>;
export type AccessKeyIdParamData = z.infer<typeof AccessKeyIdParamSchema>;
export type UpdateAccessKeyData = z.infer<typeof UpdateAccessKeySchema>;
