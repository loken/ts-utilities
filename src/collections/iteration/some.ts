/** One or more instances of `T`. */
export type Some<T> = T | T[] | Set<T>;


/**
 * Iterate one or more `sources`, or several such sources.
 *
 * The benefit is to hide the complexity of the variations in
 * format of the `sources` at the call site.
 * @param sources One or more sources.
 */
export function *iterateSome<T>(...sources: Some<T>[]): Generator<T> {
	for (const source of sources) {
		if (Array.isArray(source) || source instanceof Set) {
			for (const s of source)
				yield s;
		}
		else {
			yield source;
		}
	}
}


/**
 * Turn some `sources` into an iterable with the least amount of modification.
 *
 * This means return it as it is unless it's a single item, in which case, wrap it in an array.
 */
export const someToIterable = <T>(sources: Some<T>): T[] | Set<T> => {
	if (Array.isArray(sources) || sources instanceof Set)
		return sources;
	else
		return [ sources ];
};

/**
 * Create an array from some `sources`.
 * @param sources One or more sources.
 * @param reuseArray When the `sources` is already an array, should we reuse it (default: true) or create a shallow clone (false)?
 */
export const someToArray = <T>(sources: Some<T>, reuseArray = true): T[] => {
	if (Array.isArray(sources))
		return reuseArray ? sources : [ ...sources ];
	if (sources instanceof Set)
		return [ ...sources ];
	else
		return [ sources ];
};

/**
 * Create a Set from some `sources`.
 * @param sources One or more sources.
 * @param reuseSet When the `sources` is already a Set, should we reuse it (default: true) or create a shallow clone (false)?
 */
export const someToSet = <T>(sources: Some<T>, reuseSet = true): Set<T> => {
	if (Array.isArray(sources))
		return new Set(sources);
	if (sources instanceof Set)
		return reuseSet ? sources : new Set(sources);
	else
		return new Set([ sources ]);
};


/**
 * Add one or more `sources`, or several such sources, to an existing `target` array or `Set`.
 * @param source One or more sources.
 * @param target The target to receive the sources.
 * @returns The mutated target.
 */
export const addSome = <T, Target extends T[] | Set<T>>(target: Target, ...sources: Some<T>[]): Target => {
	if (Array.isArray(target)) {
		for (const source of sources) {
			if (Array.isArray(source) || source instanceof Set)
				target.push(...source);
			else
				target.push(source);
		}
	}
	else {
		for (const source of sources) {
			if (Array.isArray(source) || source instanceof Set) {
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
export const removeSome = <T, Target extends T[] | Set<T> | Map<T, any>>(target: Target, ...sources: Some<T>[]): Target => {
	if (Array.isArray(target)) {
		for (let i = target.length - 1; i >= 0; i--) {
			const tar = target[i]!;
			if (sources.some(source => inSome(tar, source)))
				target.splice(i, 1);
		}
	}
	else {
		for (const s of iterateSome(...sources))
			target.delete(s);
	}

	return target;
};


/**
 * Check whether the `item` is contained in `some` through a strict equality check.
 */
export const inSome = <T>(item: T, some: Some<T>) => {
	if (Array.isArray(some))
		return some.includes(item);
	else if (some instanceof Set)
		return some.has(item);
	else
		return item === some;
};
