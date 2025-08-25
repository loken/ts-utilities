import { resolveValueProvider, type ValueProvider } from '../patterns/value-provider.js';


/**
 * Get a `TValue` from the `map`, and add it first if it doesn't already exist in the map.
 * @param map - The map containing values.
 * @param key - The key to use when retrieving a value.
 * @param def - The provider of a value to use when the key does not already exist in the map.
 * @param retrieveAction - An optional action to perform on the value when it already exists in the map.
 */
export const mapGetLazy = <TKey, TValue>(
	map: Map<TKey, TValue>,
	key: TKey,
	def: ValueProvider<TValue>,
	retrieveAction?: (value: TValue) => void,
): TValue => {
	if (map.has(key)) {
		const val = map.get(key)!;
		retrieveAction?.(val);

		return val;
	}

	const val: TValue = resolveValueProvider(def);

	map.set(key, val);

	return val;
};

/**
 * Get a `Set<TValue>` from the `map`, and add it first if it doesn't already exist in the map.
 * @param map - The map containing values.
 * @param key - The key to use when retrieving a value.
 * @param retrieveAction - An optional action to perform on the value when it already exists in the map.
 */
export const mapGetLazySet = <TKey, TValue>(
	map: Map<TKey, Set<TValue>>,
	key: TKey,
	retrieveAction?: (value: Set<TValue>) => void,
): Set<TValue> => {
	return mapGetLazy(map, key, () => new Set<TValue>(), retrieveAction);
};

/**
 * Get a `Map<MKey, MValue>` from the `map`, and add it first if it doesn't already exist in the map.
 * @param map - The map containing values.
 * @param key - The key to use when retrieving a value.
 * @param retrieveAction - An optional action to perform on the value when it already exists in the map.
 */
export const mapGetLazyMap = <TKey, MKey, MValue>(
	map: Map<TKey, Map<MKey, MValue>>,
	key: TKey,
	retrieveAction?: (value: Map<MKey, MValue>) => void,
): Map<MKey, MValue> => {
	return mapGetLazy(map, key, () => new Map<MKey, MValue>(), retrieveAction);
};
