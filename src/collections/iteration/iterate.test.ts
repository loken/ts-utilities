import { describe, expect, test } from 'vitest';

import { iterateAll } from './iterate.js';


describe('iterateAll', () => {
	const exposed: string[] = [];

	const testGenerator = function*() {
		yield 'a';
		exposed.push('a');
		yield 'b';
		exposed.push('b');
		yield 'c';
		exposed.push('c');
	};

	test('iterates fully', () => {
		iterateAll(testGenerator());

		expect(exposed).to.have.members([ 'a', 'b', 'c' ]);
	});
});
