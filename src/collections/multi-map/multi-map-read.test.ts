import { describe, expect, test } from 'vitest';

import { MultiMap } from './multi-map.js';


describe('MultiMap read operations', () => {
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

	test('read from record with multiple keys', () => {
		const map = MultiMap.readRecord({
			A: [ 'A1', 'A2' ],
			B: [ 'B1' ],
			C: [],
		});

		expect(map.size).to.equal(3);
		expect(map.get('A')).has.keys([ 'A1', 'A2' ]);
		expect(map.get('B')).has.keys([ 'B1' ]);
		expect(map.get('C')).is.empty;
	});

	test('read from JSON with empty arrays', () => {
		const map = MultiMap.readJson('{"A": ["A1"], "B": [], "C": ["C1", "C2"]}');

		expect(map.size).to.equal(3);
		expect(map.get('A')).has.keys([ 'A1' ]);
		expect(map.get('B')).is.empty;
		expect(map.get('C')).has.keys([ 'C1', 'C2' ]);
	});

	test('read from empty record', () => {
		const map = MultiMap.readRecord({});

		expect(map.size).to.equal(0);
	});

	test('read from empty JSON', () => {
		const map = MultiMap.readJson('{}');

		expect(map.size).to.equal(0);
	});
});
