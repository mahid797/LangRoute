import {
	type DefaultValues,
	type FieldValues,
	type Path,
	type Resolver,
	UseFormSetError,
	useForm,
} from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*  Internal validation‐abort sentinel                                        */
/* -------------------------------------------------------------------------- */
export class ValidationAbortError extends Error {
	constructor() {
		super('Client-side validation failed.');
		this.name = 'ValidationAbortError';
	}
}

/* -------------------------------------------------------------------------- */
/*  Zod schema type that outputs TValues (input can be anything)              */
/* -------------------------------------------------------------------------- */
type AnySchemaFor<TValues extends FieldValues> = z.Schema<TValues>;

/* -------------------------------------------------------------------------- */
/*  Version-safe resolver adapter (handles resolver generics across versions) */
/* -------------------------------------------------------------------------- */
function resolverFor<TValues extends FieldValues>(
	schema: AnySchemaFor<TValues>,
): Resolver<TValues> {
	// Zod v4 classic `Schema` and resolver's expected `ZodType` differ at the type level,
	// but are compatible at runtime.
	// @ts-expect-error – bridge Zod v4 Schema to resolver
	return zodResolver(schema) as Resolver<TValues>;
}

/* -------------------------------------------------------------------------- */
/*  Shared helper:                       form.buildPayload()                  */
/* -------------------------------------------------------------------------- */
function buildPayload<S extends z.Schema<FieldValues, unknown>>(
	schema: S,
	values: unknown,
	setError: UseFormSetError<z.output<S>>,
): z.output<S> {
	const result = schema.safeParse(values);
	if (result.success) return result.data;

	result.error.issues.forEach(({ path, message }) => {
		const field = String(path.join('.')) as Path<z.output<S>>;
		setError(field, { type: 'manual', message });
	});
	throw new ValidationAbortError();
}

/**
 * Generic helper – plug a Zod schema into react-hook-form with defaults.
 *
 * @example
 * const form = useFormWithSchema(MySchema, myDefaults);
 */
export function useFormWithSchema<TValues extends FieldValues>(
	schema: AnySchemaFor<TValues>,
	defaults: DefaultValues<TValues>,
	mode: 'onBlur' | 'onChange' | 'onSubmit' = 'onBlur',
) {
	const form = useForm<TValues>({
		resolver: resolverFor(schema),
		defaultValues: defaults,
		mode,
	});

	/* attach the helper */
	return {
		...form,
		/** Parse with the provided schema (or the original one if omitted). */
		buildPayload: (override?: AnySchemaFor<TValues>) =>
			buildPayload(override ?? schema, form.getValues(), form.setError),
	};
}
