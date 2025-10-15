'use client';

// ──────────────────────────────────────────────────────────────────────────────
// PasswordValidation.tsx
// ----------------------------------------------------------------------------
// Live “strength” feedback shown below a password field.
// Relies on getPasswordChecks() so the regexes remain DRY.
// ----------------------------------------------------------------------------
import { CheckCircleIcon, XCircleIcon } from '@icons';

import { getPasswordChecks } from '@/lib/validation';

interface PasswordValidationProps {
	/** Current password text from the parent form */
	passwordValue: string;
	/** Show red cross icons only after the field has lost focus */
	isBlur?: boolean;
}

export default function PasswordValidation({
	passwordValue,
	isBlur = false,
}: PasswordValidationProps) {
	const { isLengthValid, hasUppercase, hasSymbol } = getPasswordChecks(passwordValue);

	/**
	 * Returns the appropriate icon for each rule.
	 * – While the user is typing (not blurred yet), we show grey “disabled”
	 *   circles to avoid scaring them.
	 * – After blur, failing rules show a red X.
	 */
	const renderIcon = (rulePassed: boolean) =>
		passwordValue && !rulePassed && isBlur ? (
			<XCircleIcon color='error' />
		) : (
			<CheckCircleIcon color={rulePassed ? 'success' : 'disabled'} />
		);

	return (
		<div className='mb-10 flex flex-col gap-3'>
			{/* ≥ 8 chars ----------------------------------------------------------- */}
			<div className='flex items-center gap-3'>
				{renderIcon(isLengthValid)}
				<p className='body2'>Must be at least 8 characters</p>
			</div>

			{/* uppercase ---------------------------------------------------------- */}
			<div className='flex items-center gap-3'>
				{renderIcon(hasUppercase)}
				<p className='body2'>Must contain at least one uppercase letter</p>
			</div>

			{/* symbol ------------------------------------------------------------- */}
			<div className='flex items-center gap-3'>
				{renderIcon(hasSymbol)}
				<p className='body2'>Must include at least one symbol</p>
			</div>
		</div>
	);
}
