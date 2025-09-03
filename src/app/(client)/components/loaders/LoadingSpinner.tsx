import { SpinnerIcon } from '@icons';

import { cn } from '@/lib/utils';

export default function LoadingSpinner({ className }: { className?: string }) {
	return (
		<div
			className='bg-background/60 fixed inset-0 z-[1000] flex items-center justify-center backdrop-blur-sm'
			role='status'
			aria-label='Loading…'
		>
			<SpinnerIcon className={cn('size-24', className)} />
		</div>
	);
}
