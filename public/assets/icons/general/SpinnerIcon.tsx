import React, { FC, SVGProps } from 'react';

import { cn } from '@/lib/utils';

interface SpinnerIconProps extends SVGProps<SVGSVGElement> {
	color?: string;
	strokeWidth?: number;
	className?: string;
}

/**
 * A reusable SVG icon component for rendering an icon.
 *
 * @param {string} [color='currentColor'] - The stroke color of the icon. Accepts any valid CSS color value. Optional.
 * @param {number} [strokeWidth=2] - The stroke width of the icon's path. Optional.
 * @param {string} [className] - Extra CSS classes applied to the <svg>.
 * @param {SVGProps<SVGSVGElement>} props - Additional SVG props such as `style`, or custom attributes.
 *
 * @returns {JSX.Element} A scalable vector graphic (SVG) element representing the icon.
 */

const SpinnerIcon: FC<SpinnerIconProps> = ({
	color = 'currentColor',
	strokeWidth = 2,
	className,
	...props
}) => {
	return (
		<svg
			className={cn('animate-spin', className)}
			xmlns='http://www.w3.org/2000/svg'
			fill='none'
			viewBox='0 0 24 24'
			aria-label='Spinner Icon'
			{...props}
		>
			<circle
				className='opacity-25'
				cx='12'
				cy='12'
				r='10'
				stroke={color}
				strokeWidth={strokeWidth}
			/>
			<path
				d='M12 2 A10 10 0 0 1 22 12'
				fill='none'
				stroke={color}
				strokeWidth='8'
				strokeLinecap='round'
				className='opacity-75'
				vectorEffect='non-scaling-stroke'
			/>
		</svg>
	);
};

export default SpinnerIcon;
