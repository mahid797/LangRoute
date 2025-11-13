/*
Table utilities
- compareValues(a, b): ascending-oriented comparator for primitive-like values.
* strings → Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
* numbers → numeric compare
* dates → if both appear ISO-like (or Date instances), compare by ms since epoch
* booleans → false < true
* null/undefined → treated as greater in ascending (so they float to the end)
(and consequently come first when you negate for descending)
- stableSort(arr, cmp): decorate/sort/undecorate to preserve original order for ties
*/

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

const ISOish = /^(\d{4}-\d{2}-\d{2})([Tt\s]\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?)?(Z|[+-]\d{2}:\d{2})?$/;

function isNullish(v: unknown): v is null | undefined {
	return v === null || v === undefined;
}

function isDateInstance(v: unknown): v is Date {
	return v instanceof Date && !Number.isNaN(v.getTime());
}

function isISODateString(v: unknown): v is string {
	return typeof v === 'string' && ISOish.test(v);
}

export function compareValues(a: unknown, b: unknown): number {
	// 1) Nullish handling (null/undefined are always greater on ascending)
	const aNull = isNullish(a);
	const bNull = isNullish(b);
	if (aNull && bNull) return 0;
	if (aNull) return 1;
	if (bNull) return -1;

	// 2) Numbers
	if (typeof a === 'number' && typeof b === 'number') {
		// NaN is treated as nullish-like (to the end)
		if (Number.isNaN(a) && Number.isNaN(b)) return 0;
		if (Number.isNaN(a)) return 1;
		if (Number.isNaN(b)) return -1;
		return a - b;
	}

	// 3) Booleans (false < true)
	if (typeof a === 'boolean' && typeof b === 'boolean') {
		return Number(a) - Number(b);
	}

	// 4) Dates (real Date objects or ISO-ish strings)
	const aIsDateLike = isDateInstance(a) || isISODateString(a);
	const bIsDateLike = isDateInstance(b) || isISODateString(b);
	if (aIsDateLike && bIsDateLike) {
		const ta = isDateInstance(a) ? a.getTime() : new Date(a as string).getTime();
		const tb = isDateInstance(b) ? b.getTime() : new Date(b as string).getTime();
		if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
		if (Number.isNaN(ta)) return 1;
		if (Number.isNaN(tb)) return -1;
		return ta - tb;
	}

	// 5) Strings (natural order, case-insensitive via sensitivity: 'base')
	if (typeof a === 'string' && typeof b === 'string') {
		return collator.compare(a, b);
	}

	// 6) Fallback: compare stringified forms (keeps comparator total)
	return collator.compare(String(a), String(b));
}

export function stableSort<T>(arr: T[], cmp: (a: T, b: T) => number): T[] {
	return arr
		.map((value, index) => ({ value, index }))
		.sort((x, y) => {
			const result = cmp(x.value, y.value);
			return result !== 0 ? result : x.index - y.index;
		})
		.map((x) => x.value);
}
