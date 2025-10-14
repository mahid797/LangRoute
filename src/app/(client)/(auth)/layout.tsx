import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Auth',
	description: 'Authentication pages',
};

/**
 * Centered layout for authentication pages
 * @param children - The content to display within the authentication layout
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<main className='flex min-h-screen items-center justify-center'>
			<div className='container flex min-w-lg flex-col items-center gap-10'>{children}</div>
		</main>
	);
}
