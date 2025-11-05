'use client';

import { ChevronDownIcon, ChevronSelectorVerticalIcon, ChevronUpIcon } from '@icons';

import { cn } from '@/lib/utils';

import type { SortDir } from './types';

interface SortIndicatorProps {
	dir?: SortDir; // 'asc' | 'desc' (undefined when inactive)
	active?: boolean;
	className?: string;
}

export default function SortIndicator({ dir, active = false, className }: SortIndicatorProps) {
	return (
		<span
			aria-hidden='true'
			className={cn(
				'ml-1 inline-flex h-4 w-4 shrink-0 items-center justify-center transition-opacity duration-150',
				active ? 'opacity-100' : 'opacity-50',
				className,
			)}
		>
			{!active ? (
				<ChevronSelectorVerticalIcon />
			) : dir === 'asc' ? (
				<ChevronUpIcon />
			) : (
				<ChevronDownIcon />
			)}
		</span>
	);
}
