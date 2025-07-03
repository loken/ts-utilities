import { describe, expect, test } from 'vitest';

import { MultiMap } from './multi-map.js';


describe('MultiMap core functionality', () => {
	test('constructor creates empty MultiMap', () => {
		const map = new MultiMap<string>();

		expect(map.size).to.equal(0);
	});

	test('getAll returns all keys and values', () => {
		const map = new MultiMap<string>();
		map.add('A', [ 'A1', 'A2' ]);
		map.add('B', [ 'B1' ]);
		map.add('C', []);

		const all = map.getAll();
		expect(all).has.keys([ 'A', 'A1', 'A2', 'B', 'B1', 'C' ]);
		expect(all.size).to.equal(6);
	});

	test('getOrAdd creates set if key does not exist', () => {
		const map = new MultiMap<string>();

		const set = map.getOrAdd('newKey');
		expect(set.size).to.equal(0);
		expect(map.has('newKey')).to.be.true;
		expect(map.get('newKey')).to.equal(set);
	});

	test('getOrAdd returns existing set if key exists', () => {
		const map = new MultiMap<string>();
		map.add('existingKey', [ 'value1' ]);

		const set = map.getOrAdd('existingKey');
		expect(set.size).to.equal(1);
		expect(set.has('value1')).to.be.true;
	});

	test('addEmpty creates empty set for key', () => {
		const map = new MultiMap<string>();

		const set = map.addEmpty('emptyKey');
		expect(set.size).to.equal(0);
		expect(map.has('emptyKey')).to.be.true;
		expect(map.get('emptyKey')).to.equal(set);
	});

	test('add with single value', () => {
		const map = new MultiMap<string>();

		const added = map.add('key1', 'value1');
		expect(added).to.equal(1);
		expect(map.get('key1')!.has('value1')).to.be.true;
		expect(map.get('key1')!.size).to.equal(1);
	});

	test('add with multiple values', () => {
		const map = new MultiMap<string>();

		const added = map.add('key1', [ 'value1', 'value2', 'value3' ]);
		expect(added).to.equal(3);
		expect(map.get('key1')!).has.keys([ 'value1', 'value2', 'value3' ]);
	});

	test('add with duplicate values', () => {
		const map = new MultiMap<string>();

		const added1 = map.add('key1', [ 'value1', 'value2' ]);
		const added2 = map.add('key1', [ 'value2', 'value3' ]);

		expect(added1).to.equal(2);
		expect(added2).to.equal(1); // Only value3 was new
		expect(map.get('key1')!).has.keys([ 'value1', 'value2', 'value3' ]);
		expect(map.get('key1')!.size).to.equal(3);
	});

	test('remove values from existing key', () => {
		const map = new MultiMap<string>();
		map.add('key1', [ 'value1', 'value2', 'value3' ]);

		const removed = map.remove('key1', [ 'value1', 'value3' ]);

		expect(removed).has.keys([ 'value1', 'value3' ]);
		expect(removed.size).to.equal(2);
		expect(map.get('key1')!).has.keys([ 'value2' ]);
		expect(map.has('key1')).to.be.true; // Key still exists
	});

	test('remove all values removes key', () => {
		const map = new MultiMap<string>();
		map.add('key1', [ 'value1', 'value2' ]);

		const removed = map.remove('key1', [ 'value1', 'value2' ]);

		expect(removed).has.keys([ 'value1', 'value2', 'key1' ]); // Include key when removed
		expect(removed.size).to.equal(3);
		expect(map.has('key1')).to.be.false; // Key was removed
	});

	test('remove from non-existent key returns empty set', () => {
		const map = new MultiMap<string>();

		const removed = map.remove('nonExistentKey', [ 'value1' ]);

		expect(removed.size).to.equal(0);
		expect(map.has('nonExistentKey')).to.be.false;
	});

	test('remove non-existent values returns empty set', () => {
		const map = new MultiMap<string>();
		map.add('key1', [ 'value1' ]);

		const removed = map.remove('key1', [ 'nonExistentValue' ]);

		expect(removed.size).to.equal(0);
		expect(map.get('key1')!).has.keys([ 'value1' ]); // Original value still there
	});

	test('remove partial match', () => {
		const map = new MultiMap<string>();
		map.add('key1', [ 'value1', 'value2' ]);

		const removed = map.remove('key1', [ 'value1', 'nonExistentValue' ]);

		expect(removed).has.keys([ 'value1' ]);
		expect(removed.size).to.equal(1);
		expect(map.get('key1')!).has.keys([ 'value2' ]);
	});

	test('complex operations', () => {
		const map = new MultiMap<number>();

		// Build a tree structure: 1 -> [11, 12], 11 -> [111, 112], 2 -> [21]
		map.add(1, [ 11, 12 ]);
		map.add(11, [ 111, 112 ]);
		map.add(2, [ 21 ]);

		expect(map.size).to.equal(3);
		expect(map.getAll()).has.keys([ 1, 11, 12, 111, 112, 2, 21 ]);
		expect(map.getAll().size).to.equal(7);

		// Remove some values
		const removed1 = map.remove(1, [ 12 ]);
		expect(removed1).has.keys([ 12 ]);
		expect(map.get(1)!).has.keys([ 11 ]);

		// Remove all values from a key
		const removed2 = map.remove(11, [ 111, 112 ]);
		expect(removed2).has.keys([ 111, 112, 11 ]); // Include key
		expect(map.has(11)).to.be.false;

		// Final state
		expect(map.size).to.equal(2);
		expect(map.get(1)!).has.keys([ 11 ]);
		expect(map.get(2)!).has.keys([ 21 ]);
	});

	test('works with different types', () => {
		const stringMap = new MultiMap<string>();
		stringMap.add('str', [ 'a', 'b' ]);
		expect(stringMap.get('str')!).has.keys([ 'a', 'b' ]);

		const numberMap = new MultiMap<number>();
		numberMap.add(1, [ 2, 3 ]);
		expect(numberMap.get(1)!).has.keys([ 2, 3 ]);
	});
});
