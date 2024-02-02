/** One or more instances of `T`. */
export type Multiple<T> = T | T[] | Set<T> | IterableIterator<T>;

/**
 * Iterate multiple `sources`.
 *
 * The benefit is to hide the complexity of the variations in
 * format of the `sources` at the call site.
 * @param sources One or more sources.
 */
export function* iterateMultiple<T>(sources: Multiple<T>): Generator<T> {
	if (typeof sources === 'object' && sources !== null && Symbol.iterator in sources) {
		for (const source of sources)
			yield source;
	}
	else {
		yield sources;
	}
}

/**
 * Spread multiple `sources` into an array.
 * @param sources One or more sources.
 * @param reuseArray When the `sources` is already an array, should we reuse it (true) or spread into a clone (false)?
 */
export const spreadMultiple = <T>(sources: Multiple<T>, reuseArray = true): T[] => {
	if (reuseArray && Array.isArray(sources))
		return sources;
	if (typeof sources === 'object' && sources !== null && Symbol.iterator in sources)
		return [ ...sources ];
	else
		return [ sources ];
};

/**
 * Add one or more `source` items to an existing `target` array or `Set`.
 * @param source One or more source items.
 * @param target The target to receive the source items.
 * @returns The number of items that were added.
 */
export const addMultiple = <T>(source: Multiple<T>, target: T[] | Set<T>) => {
	if (Array.isArray(target)) {
		const len = target.length;
		for (const item of iterateMultiple(source))
			target.push(item);

		return target.length - len;
	}
	else {
		const size = target.size;
		for (const item of iterateMultiple(source))
			target.add(item);

		return target.size - size;
	}
};

/**
 * Add one or more `sources` of items to an existing `target` array or `Set`.
 * @param source One or more sources of items.
 * @param target The target to receive the items of the sources.
 * @returns The number of items that were added.
 */
export const addMultiples = <T>(sources: Multiple<T>[], target: T[] | Set<T>) => {
	let count = 0;
	for (const source of sources)
		count += addMultiple(source, target);

	return count;
};
