import { splitBy, splitKvp } from '../../primitives/string/splitting.js';
import { getTrim, trimBy } from '../../primitives/string/trimming.js';
import { addMultiple, iterateMultiple, type Multiple } from '../iteration/multiple.js';
import { mapGetLazy } from '../map.js';
import { type MultiMapParsing, type MultiMapRendering, type MultiMapSeparators, type MultiMapTrim } from './multi-map-types.js';


/**
 * A Map of values to sets of values.
 */
export class MultiMap<T = string> extends Map<T, Set<T>> {

	//#region set management.
	/**
	 * Get the `Set` at the `key` if it already exists or add and return an empty `Set` otherwise.
	 * @param key The map key.
	 * @returns The `Set<T>` that already existed or was added.
	 */
	public getOrAdd(key: T) {
		return mapGetLazy(this, key, () => new Set<T>());
	}

	/**
	 * Add one or more `values` to the set at the `key`.
	 *
	 * Will create and add the `Set` to the `Map` if it doesn't already exist.
	 * @param key The map key.
	 * @param values The values to add.
	 * @returns The number of values that were added.
	 */
	public add(key: T, values: Multiple<T>): number {
		const set = this.getOrAdd(key);

		return addMultiple(values, set);
	}

	/**
	 * Remove one ore more `values` from the set ata the `key`.
	 *
	 * Will delete the `Set` from the `Map` if it ends up empty after removing the `values`.
	 * @param key The map key.
	 * @param values The values to remove.
	 * @returns The subset of `values` that were previously in the `Set`.
	 */
	public remove(key: T, values: Multiple<T>): T[] {
		const set = this.getOrAdd(key);

		const removed: T[] = [];

		for (const value of iterateMultiple(values)) {
			if (set.delete(value))
				removed.push(value);
		}

		if (set.size === 0)
			this.delete(key);

		return removed;
	}
	//#endregion

	//#region serialization
	/**
	 * Parse the `input` into the existing `MultiMap`.
	 *
	 * If you want to obtain a `MultiMap` of something which isn't a string, you must provide a `transform`.
	 *
	 * @param input The string to parse.
	 * @param options How to parse the `input` into a `MultiMap`.
	 */
	public parse(input: string, options?: MultiMapParsing<T>): this {
		const sep = MultiMap.getSeparators(options);
		const trim: Required<MultiMapTrim> = {
			input:   getTrim('input',   options?.trim, 'both'),
			entries: getTrim('entries', options?.trim, 'start'),
			keys:    getTrim('keys',    options?.trim, 'none'),
			values:  getTrim('values',  options?.trim, 'none'),
		};

		if (sep.prefix && input.startsWith(sep.prefix))
			input = input.substring(sep.prefix.length);
		if (sep.suffix && input.endsWith(sep.suffix))
			input = input.substring(0, input.length - sep.suffix.length);

		input = trimBy(input, trim.input);

		const lines = splitBy(input, {
			sep:  sep.entry,
			trim: trim.entries,
		});

		for (const line of lines) {
			const [ rawKey, rawValue ] = splitKvp(line, { sep: sep.keyValue });
			const trimmedKey = trimBy(rawKey, trim.keys);
			const key = options?.transform?.(trimmedKey) ?? (trimmedKey as T);

			if (rawValue === null) {
				this.getOrAdd(key);
			}
			else {
				this.add(key, splitBy(rawValue, { sep: sep.value }).map(value => {
					const v = trimBy(value, trim.values);

					return options?.transform?.(v) ?? (v as T);
				}));
			}
		}

		return this;
	}

	/**
	 * Render into a `string`.
	 *
	 * If you provide a `transform` it will be used instead of string-coercion for transforming `T`s into `string`s.
	 */
	public render(options?: MultiMapRendering<T>): string {
		const sep = MultiMap.getSeparators(options);

		const entries: string[] = [];

		for (const [ rawKey, rawValues ] of this.entries()) {
			const key = options?.transform?.(rawKey) ?? rawKey;
			if (rawValues.size === 0) {
				entries.push(`${ key }`);
			}
			else {
				const values: string = [ ...rawValues ].map(v => options?.transform?.(v) ?? v).join(sep.value);
				const entry = `${ key }${ sep.keyValue }${ values }`;

				entries.push(entry);
			}
		}

		let output = entries.join(sep.entry);
		if (sep.prefix)
			output = sep.prefix + output;
		if (sep.suffix)
			output += sep.suffix;

		return output;
	}

	/**
	 * Parse the `input` into a `MultiMap`.
	 *
	 * If you want to obtain a `MultiMap` of something which isn't a string, you must provide a `transform`.
	 *
	 * @param input The string to parse.
	 * @param options How to parse the `input` into a `MultiMap`.
	 */
	public static parse = <T = string>(input: string, options?: MultiMapParsing<T>): MultiMap<T> => {
		return new MultiMap<T>().parse(input, options);
	};

	/**
	 * Render the `multiMap` into a `string`.
	 *
	 * If you provide a `transform` it will be used instead of string-coercion for transforming `T`s into `string`s.
	 */
	public static render<T>(multiMap: MultiMap<T>, options?: MultiMapRendering<T>): string {
		return multiMap.render(options);
	}
	//#endregion

	/** The default values for `MultiMapSeparators`. */
	public static readonly defaultSeparators: MultiMapSeparators = Object.freeze({
		entry:    '\n',
		keyValue: ':',
		value:    ',',
	});

	/** Create `MultiMapSeparators` from the `separators` and `defaultSeparators`. */
	public static getSeparators(separators?: MultiMapSeparators) {
		return {
			...MultiMap.defaultSeparators,
			...separators,
		};
	}

}
