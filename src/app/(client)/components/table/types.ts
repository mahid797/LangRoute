import { ReactNode } from 'react';

export type SortDir = 'asc' | 'desc';

export interface ColumnSpec<T> {
	id: string; // unique per column
	header: ReactNode; // column header node/label
	cell: (row: T) => ReactNode; // render a cell from a row
	accessor?: (row: T) => unknown; // used for sorting; omit to disable sort
	sortable?: boolean; // default false; true implies accessor is set
	align?: 'left' | 'right' | 'center';
	widthClass?: string; // tailwind width (e.g., 'w-[20%]')
	headerSrOnly?: boolean; // if header text should be screen-reader only
}

export interface DataTableProps<T> {
	rows: T[];
	columns: ColumnSpec<T>[];
	rowKey: (row: T) => string;
	initialSort?: { columnId: string; dir: SortDir };
	onSortChange?: (s: { columnId: string; dir: SortDir }) => void; // optional callback
	isLoading?: boolean;
	error?: string | null;
	empty?: ReactNode; // custom empty node (e.g., <EmptyState .../>)
	className?: string;
}
