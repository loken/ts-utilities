import { describe, expect, test } from 'vitest';

import { iterateAll } from './iterate.js';


describe('iterateAll', () => {
	const exposed: string[] = [];

	const testGenerator = function*(): Generator<'a' | 'b' | 'c', undefined, undefined> {
		yield 'a';
		exposed.push('a');
		yield 'b';
		exposed.push('b');
		yield 'c';
		exposed.push('c');
	};

	test('iterates fully', () => {
		iterateAll(testGenerator());

		expect(exposed).toEqual([ 'a', 'b', 'c' ]);
	});
});
