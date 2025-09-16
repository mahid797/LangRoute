import { NextResponse } from 'next/server';

import { ServiceError, handleApiError } from '@/app/(server)/services';
import { environmentService } from '@/app/(server)/services/environment/service';
import { auth } from '@/lib/auth';
import { AiKeyIdParamSchema, CreateAiKeySchema } from '@/lib/validation/aiKeys.schemas';

export async function GET() {
	try {
		// Retrieve server-side session using NextAuth
		const session = await auth();

		// Return null for unauthenticated requests (not an error condition)
		if (!session?.user) {
			return NextResponse.json({ user: null }, { status: 200 });
		}
		const aiKeys = await environmentService.getAiKeys(session.user.id);

		// Return empty array if no AI keys found
		if (!aiKeys) {
			return NextResponse.json({ aiKeys: [] }, { status: 200 });
		}

		// Return registered AI keys for the user
		return NextResponse.json({ aiKeys }, { status: 200 });
	} catch (error: unknown) {
		return handleApiError('get ai keys', error);
	}
}

export async function POST(request: Request) {
	try {
		// Retrieve server-side session using NextAuth
		const session = await auth();

		// Return null for unauthenticated requests (not an error condition)
		if (!session?.user) {
			return NextResponse.json({ user: null }, { status: 200 });
		}

		// Parse and validate request body
		const body = await request.json().catch(() => null);
		if (!body) {
			throw new ServiceError('No request body provided', 400);
		}
		const parsedBody = CreateAiKeySchema.safeParse(body);

		// Return validation errors
		if (!parsedBody.success) {
			let message = 'Validation error';
			if (parsedBody.error.issues.length > 0) {
				parsedBody.error.issues.forEach((issue) => {
					message += `\n- ${issue.message}`;
				});
			}
			throw new ServiceError(message, 422, undefined, JSON.parse(parsedBody.error.message));
		}

		// Delegate business logic to service layer
		const aiKey = await environmentService.createAiKey({
			...parsedBody.data,
			createdBy: session.user.id,
		});
		return NextResponse.json({ aiKey }, { status: 201 });
	} catch (error: unknown) {
		return handleApiError('create ai key', error);
	}
}

export async function DELETE(request: Request) {
	try {
		// Retrieve server-side session using NextAuth
		const session = await auth();

		// Return null for unauthenticated requests (not an error condition)
		if (!session?.user) {
			return NextResponse.json({ user: null }, { status: 200 });
		}

		// Parse and validate request body
		const body = await request.json().catch(() => null);
		if (!body || !body.aiKeyId) {
			return NextResponse.json({ error: 'AI key ID is required' }, { status: 400 });
		}
		const keyId = body.aiKeyId;

		const validateAiKey = AiKeyIdParamSchema.safeParse({ id: keyId });
		if (!validateAiKey.success) {
			return NextResponse.json(
				{ error: 'Validation error', details: validateAiKey.error },
				{ status: 422 },
			);
		}

		// Delegate business logic to service layer
		await environmentService.deleteAiKey(keyId, session.user.id);
		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error: unknown) {
		return handleApiError('delete ai key', error);
	}
}

export async function PATCH(request: Request) {
	try {
		// Retrieve server-side session using NextAuth
		const session = await auth();

		// Return null for unauthenticated requests (not an error condition)
		if (!session?.user) {
			return NextResponse.json({ user: null }, { status: 200 });
		}

		// Parse and validate request body
		const body = await request.json().catch(() => null);
		if (!body || !body.aiKeyId) {
			return NextResponse.json({ error: 'AI key ID is required' }, { status: 400 });
		}
		const keyId = body.aiKeyId;

		const validateAiKey = AiKeyIdParamSchema.safeParse({ id: keyId });
		if (!validateAiKey.success) {
			return NextResponse.json(
				{ error: 'Validation error', details: validateAiKey.error },
				{ status: 422 },
			);
		}

		// Delegate business logic to service layer
		const validatedKey = await environmentService.validateAiKey(keyId, session.user.id);
		return NextResponse.json({ validatedKey }, { status: 200 });
	} catch (error: unknown) {
		return handleApiError('validate ai key', error);
	}
}
