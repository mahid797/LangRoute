import { ServiceError } from '@services';

import prisma from '@/db/prisma';

export interface UsageStats {
	totalRequests: number;
	totalTokens: number;
	totalCost: number;
	periodStart: Date;
	periodEnd: Date;
}

export class UsageService {
	/**
	 * Get usage statistics for a user
	 * @param userId - The user ID to get usage for
	 * @returns Usage statistics for the user
	 * @throws ServiceError(404) if the user is not found
	 */
	static async getUserUsage(userId: string): Promise<UsageStats> {
		// For now, return mock data since we don't have usage tracking tables yet
		// TODO: Implement actual usage tracking when usage tables are added to schema

		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new ServiceError('User not found', 404, 'NOT_FOUND');
		}

		const now = new Date();
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

		return {
			totalRequests: 0,
			totalTokens: 0,
			totalCost: 0,
			periodStart: monthStart,
			periodEnd: now,
		};
	}
}
