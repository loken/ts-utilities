import { describe, expect, it } from 'vitest';
import { mapGetLazyNested, type NestedMap } from './map-nested.js';


describe('mapGetLazyNested', () => {
	it('Should create path to new value and retrieve it', () => {
		const map: NestedMap<string, { val: number }> = new Map();
		const value = mapGetLazyNested(map, [ 'a', 'b', 'c' ], () => ({ val: 10 }));

		const outer = map.get('a') as NestedMap<string, number>;
		expect(outer).toBeInstanceOf(Map);

		const inner = outer.get('b') as NestedMap<string, number>;
		expect(inner).toBeInstanceOf(Map);

		const last = inner.get('c');

		expect(value.val).toBe(10);
		expect(last, 'same instance').toBe(value);
	});

	it('Should be able to retrieve a value for a single key', () => {
		const map: NestedMap<string, number> = new Map();
		const value = mapGetLazyNested(map, 'myKey', () => 10);

		expect(value).toBe(10);
		expect(map.keys().toArray()).toEqual([ 'myKey' ]);
	});
});
