import { describe, expect, it } from 'vitest';

import { addMultiple, iterateMultiple, spreadMultiple } from '../../../src/collections/iteration/multiple.js';

describe('iterateMultiple', () => {
	it('should iterate a single item', () => {
		const item = { a: 1 };
		const result = [ ...iterateMultiple(item) ];

		expect(result).toEqual([ item ]);
	});

	it('should iterate an array of items', () => {
		const items = [ { a: 1 }, { a: 2 } ];
		const result = [ ...iterateMultiple(items) ];

		expect(result).toEqual(items);
	});

	it('should iterate a Set', () => {
		const items = [ { a: 1 }, { a: 2 } ];
		const set = new Set(items);
		const result = [ ...iterateMultiple(set) ];

		expect(result).toEqual(items);
	});

	it('should iterate an item generator', () => {
		function* generateItems() {
			yield { a: 1 };
			yield { a: 2 };
		}

		const result = [ ...iterateMultiple(generateItems()) ];

		expect(result).toEqual([ { a: 1 }, { a: 2 } ]);
	});
});

describe('spreadMultiple', () => {
	it('should wrap a single item', () => {
		const item = { a: 1 };
		const result = spreadMultiple(item);

		expect(result).toEqual([ item ]);
	});

	it('should pass an array of items through by default', () => {
		const items = [ { a: 1 }, { a: 2 } ];
		const result = spreadMultiple(items);

		expect(result === items).true;
	});

	it('should optionally spread an array of items into a new array', () => {
		interface Item { a: number }
		const items: Item[] = [ { a: 1 }, { a: 2 } ];
		const result: Item[] = spreadMultiple(items, false);

		expect(result !== items).true;
	});

	it('should spread a Set', () => {
		const result = spreadMultiple(new Set([ 1, 2, 3 ]));

		expect(result instanceof Set).toBeFalsy();
		expect(result).toEqual([ 1, 2, 3 ]);
	});

	it('should spread an generator', () => {
		function* generateItems() {
			yield { a: 1 };
			yield { a: 2 };
		}

		const result = spreadMultiple(generateItems());

		expect(result).toEqual([ { a: 1 }, { a: 2 } ]);
	});
});


describe('addMultiple', () => {
	it('should work with arrays', () => {
		const source = [ 1, 2, 3 ];
		const target = [ 2, 7, 8 ];

		addMultiple(source, target);

		expect(target).to.deep.equal([ 2, 7, 8, 1, 2, 3 ]);
	});

	it('should work with sets', () => {
		const source = new Set<number>([ 1, 2, 3 ]);
		const target = new Set<number>([ 2, 7, 8 ]);

		addMultiple(source, target);

		expect(target).to.have.keys([ 1, 2, 3, 7, 8 ]);
	});
});
