import { describe, expect, it } from 'vitest';

import { addSome, iterateSome, someToArray } from './some.js';


describe('iterateSome', () => {
	it('should iterate a single item', () => {
		const item = { a: 1 };
		const result = [ ...iterateSome(item) ];

		expect(result).toEqual([ item ]);
	});

	it('should iterate an array of items', () => {
		const items = [ { a: 1 }, { a: 2 } ];
		const result = [ ...iterateSome(items) ];

		expect(result).toEqual(items);
	});

	it('should iterate a Set', () => {
		const items = [ { a: 1 }, { a: 2 } ];
		const set = new Set(items);
		const result = [ ...iterateSome(set) ];

		expect(result).toEqual(items);
	});
});


describe('someToArray', () => {
	it('should wrap a single item', () => {
		const item = { a: 1 };
		const result = someToArray(item);

		expect(result).toEqual([ item ]);
	});

	it('should pass an array of items through by default', () => {
		const items = [ { a: 1 }, { a: 2 } ];
		const result = someToArray(items);

		expect(result === items).true;
	});

	it('should optionally spread an array of items into a new array', () => {
		interface Item { a: number }
		const items: Item[] = [ { a: 1 }, { a: 2 } ];
		const result: Item[] = someToArray(items, false);

		expect(result !== items).true;
	});

	it('should spread a Set', () => {
		const result = someToArray(new Set([ 1, 2, 3 ]));

		expect(result instanceof Set).toBeFalsy();
		expect(result).toEqual([ 1, 2, 3 ]);
	});
});


describe('addSome', () => {
	it('should work with arrays', () => {
		const source = [ 1, 2, 3 ];
		const target = [ 2, 7, 8 ];

		addSome(target, source);

		expect(target).to.deep.equal([ 2, 7, 8, 1, 2, 3 ]);
	});

	it('should work with sets', () => {
		const source = new Set<number>([ 1, 2, 3 ]);
		const target = new Set<number>([ 2, 7, 8 ]);

		addSome(target, source);

		expect(target).to.have.keys([ 1, 2, 3, 7, 8 ]);
	});

	it('should work with several sources', () => {
		const source1 = [ 1, 2, 3 ];
		const source2 = [ 10, 20, 30 ];
		const target = [ 2, 7, 8 ];

		addSome(target, source1, source2);

		expect(target).to.deep.equal([ 2, 7, 8, 1, 2, 3, 10, 20, 30 ]);
	});
});
