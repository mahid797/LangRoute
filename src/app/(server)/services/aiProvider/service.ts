import prisma from '@/db/prisma';

export interface AiProviderInterface {
	id: string;
	name: string;
	code: string;
}

class AiProviderService {
	/**
	 * Get list of AI providers saved in the database.
	 * @returns List of AI providers.
	 */
	async getAiProviders(): Promise<AiProviderInterface[]> {
		const providers = await prisma.aiProviders.findMany({
			select: {
				id: true,
				name: true,
				code: true,
			},
		});
		return providers;
	}
}

export const aiProviderService = new AiProviderService();
