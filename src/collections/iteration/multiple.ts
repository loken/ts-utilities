/** One or more instances of `T`. */
export type Multiple<T> = T | T[] | Set<T> | IterableIterator<T>;


/**
 * Iterate multiple `sources`.
 *
 * The benefit is to hide the complexity of the variations in
 * format of the `sources` at the call site.
 * @param source One or more sources.
 */
export function* iterateMultiple<T>(...sources: Multiple<T>[]): Generator<T, undefined, undefined> {
	for (const source of sources) {
		if (typeof source === 'object' && source !== null && Symbol.iterator in source) {
			for (const s of source)
				yield s;
		}
		else {
			yield source;
		}
	}
}


/**
 * Turn multiple `sources` into an iterable with the least amount of modification.
 *
 * This means return it as it is unless it's a single item, in which case, wrap it in an array,
 * or if it's an iterator, spread it into an array.
 */
export const multipleToIterable = <T>(sources: Multiple<T>): T[] | Set<T> | IterableIterator<T> => {
	if (Array.isArray(sources) || sources instanceof Set)
		return sources;
	if (typeof sources === 'object' && sources !== null && Symbol.iterator in sources)
		return sources;
	else
		return [ sources ];
};

/**
 * Spread multiple `sources` into an array.
 * @param sources One or more sources.
 * @param reuseArray When the `sources` is already an array, should we reuse it (true) or spread into a clone (false)?
 */
export const multipleToArray = <T>(sources: Multiple<T>, reuseArray = true): T[] => {
	if (Array.isArray(sources))
		return reuseArray ? sources : [ ...sources ];
	if (typeof sources === 'object' && sources !== null && Symbol.iterator in sources)
		return [ ...sources ];
	else
		return [ sources ];
};

/**
 * Spread multiple `sources` into an array.
 * @param sources One or more sources.
 * @param reuseArray When the `sources` is already an array, should we reuse it (true) or spread into a clone (false)?
 */
export const multipleToSet = <T>(sources: Multiple<T>, reuseSet = true): Set<T> => {
	if (Array.isArray(sources))
		return new Set(sources);
	if (sources instanceof Set)
		return reuseSet ? sources : new Set(sources);
	if (typeof sources === 'object' && sources !== null && Symbol.iterator in sources)
		return new Set([ ...sources ]);
	else
		return new Set([ sources ]);
};


/**
 * Add one or more `sources`, or several such sources, to an existing `target` array or `Set`.
 * @param source One or more source items.
 * @param target The target to receive the source items.
 * @returns The number of items that were added.
 */
export const addMultiple = <T, Target extends T[] | Set<T>>(target: Target, ...sources: Multiple<T>[]): Target => {
	if (Array.isArray(target)) {
		for (const source of sources) {
			if (typeof source === 'object' && source !== null && Symbol.iterator in source)
				target.push(...source);
			else
				target.push(source);
		}
	}
	else {
		for (const source of sources) {
			if (typeof source === 'object' && source !== null && Symbol.iterator in source) {
				for (const s of source)
					target.add(s);
			}
			else {
				target.add(source);
			}
		}
	}

	return target;
};

/**
 * Remove one or more `sources`, or several such sources, from an existing `target` array, `Set` or `Map`.
 * @param source One or more sources.
 * @param target The target from which to remove the sources.
 * @returns The mutated target.
 */
export const removeMultiple = <T, Target extends T[] | Set<T> | Map<T, any>>(target: Target, ...sources: Multiple<T>[]): Target => {
	if (Array.isArray(target)) {
		const allSources = addMultiple(new Set<T>(), ...sources);
		for (let i = target.length - 1; i >= 0; i--) {
			const tar = target[i]!;
			if (allSources.has(tar))
				target.splice(i, 1);
		}
	}
	else {
		for (const s of iterateMultiple(...sources))
			target.delete(s);
	}

	return target;
};
