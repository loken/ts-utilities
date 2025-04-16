import type { ValueProvider } from '../patterns/value-provider.js';
import { type Some, someToArray, iterateSome } from './iteration/some.js';
import { mapGetLazy } from './map.js';


/**
 * A nested map is a map that can contain other maps as values or values of type `TValue`.
 *
 * Note: This is useful for creating a tree-like structure where each node can have its own children.
 */
export type NestedMap<TKey, TValue> = Map<TKey, NestedMap<TKey, TValue> | TValue>;


/**
 * Get a `TValue` from the nested `map`, and add it first if it doesn't already exist.
 * @param map - The map containing nested maps and values.
 * @param path - The keys to use when lazy initializing the nested maps and the value at the last key.
 * @param def - The provider of a value to use when the keys do not already exist in the nested map.
 * @param retrieveAction - An optional action to perform on the value when it already exists in the map.
 * @throws If no keys are provided or if the "inner" keys contains a value which is not a map.
 */
export const mapGetLazyNested = <
	TKey,
	TValue,
>(
	map: NestedMap<TKey, TValue>,
	path: Some<TKey>,
	def: ValueProvider<TValue>,
	retrieveAction?: (value: TValue) => void,
) => {
	const allKeys = someToArray(path);
	if (allKeys.length === 0)
		throw new Error('Must provide at least one key.');

	const innerKeys = allKeys.slice(0, -1);
	const lastKey = allKeys[allKeys.length - 1]!;
	let iter: NestedMap<TKey, TValue> = map;
	for (const key of iterateSome(innerKeys)) {
		iter = mapGetLazy(iter, key, () => new Map() as NestedMap<TKey, TValue>) as NestedMap<TKey, TValue>;

		if (iter instanceof Map === false)
			throw new Error(`Expected a Map, but got ${ typeof iter }`);
	}

	return mapGetLazy(iter as Map<TKey, TValue>, lastKey, def, retrieveAction);
};
