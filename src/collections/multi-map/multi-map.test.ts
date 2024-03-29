import { describe, expect, test } from 'vitest';

import { MultiMap } from './multi-map.js';
import type { MultiMapSeparators } from './multi-map-types.js';


describe('MultiMap', () => {
	const sep: MultiMapSeparators = {
		entry:  '\n\t\t',
		prefix: '\n\t\t',
	};

	test('read from record', () => {
		const map = MultiMap.readRecord({ A: [ 'A1', 'A2' ] });

		expect(map.size).to.equal(1);
		expect(map.get('A')).has.keys([ 'A1', 'A2' ]);
	});

	test('read from JSON', () => {
		const map = MultiMap.readJson('{"A": ["A1", "A2"]}');

		expect(map.size).to.equal(1);
		expect(map.get('A')).has.keys([ 'A1', 'A2' ]);
	});

	test('serialization of strings', () => {
		const input = `
		A:A1,A2
		A1:A11,A12
		B:B1,B12`;

		const map = MultiMap.parse(input);
		expect(map.get('A')!).has.keys([ 'A1', 'A2' ]);

		const output = map.render(sep);
		expect(output).to.equal(input);
	});

	test('serialization of integers', () => {
		const input = `
		1:11,12
		11:111,112
		2:21,212`;

		const map = MultiMap.parse(input, { transform: parseInt });
		expect(map.get(1)!).has.keys([ 11, 12 ]);

		const output = map.render(sep);
		expect(output).to.equal(input);
	});

	test('serialization preserves keys without values', () => {
		const input = `
		KeyWithValues:A,B
		KeyWithoutValues`;

		const map = MultiMap.parse(input);
		expect(map.get('KeyWithValues')).has.keys([ 'A', 'B' ]);
		expect(map.get('KeyWithoutValues')).is.empty;

		const output = map.render(sep);
		expect(output).to.equal(input);
	});

	test('serialization with custom separators', () => {
		const input = `A>A1+A2#A1>A11+A12#B>B1+B12`;
		const sep = MultiMap.getSeparators({
			entry:    '#',
			keyValue: '>',
			value:    '+',
		});

		const map = MultiMap.parse(input, sep);
		expect(map.get('A')!).has.keys([ 'A1', 'A2' ]);

		const output = map.render(sep);
		expect(output).to.equal(input);
	});
});
