'use client';

import { useMemo, useState } from 'react';

import { cn, compareValues, stableSort } from '@/lib/utils';
import { Skeleton } from '@/shadcn-ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shadcn-ui/table';

import EmptyState from '../common/EmptyState';
import SortIndicator from './SortIndicator';
import type { ColumnSpec, DataTableProps, SortDir } from './types';

const alignToClass: Record<'left' | 'right' | 'center', string> = {
	left: 'text-left',
	right: 'text-right',
	center: 'text-center',
};

type AriaSort = 'none' | 'ascending' | 'descending';

// Map (active, dir) to the proper `aria-sort` value for the header.
function getHeaderAriaSort(isActive: boolean, dir: SortDir | undefined): AriaSort {
	if (!isActive || !dir) return 'none';
	return dir === 'asc' ? 'ascending' : 'descending';
}

/**
 * Typed shadcn Table wrapper with client-side sorting and a11y.
 *
 * @example Minimal
 * type Row = { id: string; name: string; createdAt: string };
 *
 * const columns: ColumnSpec<Row>[] = [
 *   { id: 'name', header: 'Name', cell: (r) => r.name, accessor: (r) => r.name, sortable: true },
 *   { id: 'createdAt', header: 'CreatedAt', cell: (r) => r.createdAt, accessor: (r) => r.createdAt, sortable: true },
 * ];
 *
 * <DataTable
 *   rows={data}
 *   columns={columns}
 *   rowKey={(r) => r.id}
 *   initialSort={{ columnId: 'createdAt', dir: 'desc' }}
 *   isLoading={isLoading}
 *   error={error?.message ?? null}
 * />
 */

export default function DataTable<T>({
	rows,
	columns,
	rowKey,
	initialSort,
	onSortChange,
	isLoading,
	error,
	empty = <EmptyState message='No data' />,
	className,
}: DataTableProps<T>) {
	const [sort, setSort] = useState<{ columnId: string; dir: SortDir } | null>(
		initialSort ? { columnId: initialSort.columnId, dir: initialSort.dir } : null,
	);

	// Find the column for the current sort (undefined if none).
	const activeCol = useMemo(
		() => columns.find((column) => column.id === sort?.columnId),
		[columns, sort],
	);

	// Sort rows by the active column and direction
	const sortedRows = useMemo(() => {
		if (!sort || !activeCol || !activeCol.sortable || !activeCol.accessor) return rows;
		const dirMul = sort.dir === 'asc' ? 1 : -1;
		return stableSort(
			rows,
			(ra, rb) => dirMul * compareValues(activeCol.accessor!(ra), activeCol.accessor!(rb)),
		);
	}, [rows, sort, activeCol]);

	// Handle clicks on sortable column headers
	const handleHeaderClick = (col: ColumnSpec<T>) => {
		if (!col.sortable || !col.accessor) return;
		setSort((prev) => {
			const next =
				!prev || prev.columnId !== col.id
					? { columnId: col.id, dir: 'asc' as const }
					: { columnId: col.id, dir: (prev.dir === 'asc' ? 'desc' : 'asc') as SortDir };
			onSortChange?.(next);
			return next;
		});
	};

	// Render the table's loading state
	const renderLoading = () => (
		<TableRow>
			<TableCell colSpan={columns.length}>
				<Skeleton />
			</TableCell>
		</TableRow>
	);

	// Render the table's error state
	const renderError = () => (
		<TableRow>
			<TableCell colSpan={columns.length}>
				<div className='flex items-center justify-between rounded-md border p-3 text-sm'>
					<p className='body2'>{error}</p>
				</div>
			</TableCell>
		</TableRow>
	);

	// Render the table's empty state
	const renderEmpty = () => (
		<TableRow>
			<TableCell colSpan={columns.length}>{empty}</TableCell>
		</TableRow>
	);

	return (
		<div className={cn('w-full', className)}>
			<Table>
				{/* Table Header */}
				<TableHeader>
					<TableRow>
						{columns.map((col) => {
							const alignClass = col.align ? alignToClass[col.align] : 'text-left';
							const width = col.widthClass ?? '';
							const isActive = sort?.columnId === col.id;
							const sortedDir = isActive ? sort?.dir : undefined;
							const isSortable = !!col.sortable && !!col.accessor;
							const ariaSort = getHeaderAriaSort(isActive, sortedDir);

							const headerContent = (
								<div
									className={cn(
										'flex w-full items-center gap-1',
										col.align === 'right'
											? 'justify-end'
											: col.align === 'center'
												? 'justify-center'
												: 'justify-start',
									)}
								>
									{col.headerSrOnly ? (
										<span className='sr-only'>
											{typeof col.header === 'string' ? col.header : col.id}
										</span>
									) : (
										col.header
									)}
									{isSortable ? (
										<SortIndicator
											dir={sortedDir}
											active={isActive}
										/>
									) : null}
								</div>
							);

							return (
								<TableHead
									key={col.id}
									aria-sort={ariaSort}
									className={cn(alignClass, width)}
								>
									{isSortable ? (
										<button
											type='button'
											aria-label={typeof col.header === 'string' ? col.header : col.id}
											onClick={() => handleHeaderClick(col)}
											className={cn(
												'w-full rounded-sm px-1 py-1 text-left outline-none select-none',
												'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2',
												col.align === 'right'
													? 'text-right'
													: col.align === 'center'
														? 'text-center'
														: 'text-left',
											)}
										>
											{headerContent}
										</button>
									) : (
										headerContent
									)}
								</TableHead>
							);
						})}
					</TableRow>
				</TableHeader>

				{/* Table Body */}
				<TableBody>
					{isLoading
						? renderLoading()
						: error
							? renderError()
							: sortedRows.length === 0
								? renderEmpty()
								: sortedRows.map((row) => (
										<TableRow key={rowKey(row)}>
											{columns.map((col) => (
												<TableCell
													key={col.id}
													className={cn(
														col.align ? alignToClass[col.align] : 'text-left',
														col.widthClass,
													)}
												>
													{col.cell(row)}
												</TableCell>
											))}
										</TableRow>
									))}
				</TableBody>
			</Table>
		</div>
	);
}
