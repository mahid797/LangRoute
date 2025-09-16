import prisma from '@/db/prisma';

export interface CreateAiKeyInterface {
	provider: string; // id of the AI provider
	createdBy: string; // id of the user creating the key
	aiKey: string; // the API key of the provider
	teamId?: string; // optional team ID if the key is for a team
}

export interface AiKeyInterface extends CreateAiKeyInterface {
	id: string; // unique identifier for the AI key
	createdAt: Date; // timestamp of when the key was created
	validated: boolean; // whether the key has been validated
}

class EnvironmentService {
	async createAiKey(data: CreateAiKeyInterface) {
		const provider = await prisma.aiProviders.findUnique({
			where: { code: data.provider },
		});
		if (!provider) {
			throw new Error('AI provider not found');
		}
		const aiKey = await prisma.aiKeys.create({
			data: {
				provider: provider?.id as string,
				createdBy: data.createdBy,
				aiKey: data.aiKey,
				teamId: data.teamId ?? null,
			},
		});
		return aiKey;
	}

	async getAiKeys(userId: string) {
		const aiKeys = await prisma.aiKeys.findMany({
			where: {
				createdBy: userId,
			},
		});
		return aiKeys;
	}

	async validateAiKey(keyId: string, userId: string) {
		const valid = await prisma.aiKeys.update({
			where: { id: keyId, createdBy: userId },
			data: { validated: true },
		});
		return valid;
	}

	async deleteAiKey(keyId: string, userId: string) {
		const deleted = await prisma.aiKeys.delete({
			where: {
				id: keyId,
				createdBy: userId,
			},
		});
		return deleted;
	}
}

export const environmentService = new EnvironmentService();
