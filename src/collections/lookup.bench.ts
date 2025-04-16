/**
 * Benchmark showing to what degree looking up items by their value or key from a
 * set or map is faster than looking them up from an array, depending on the number items.
 */
import { bench, describe, expect } from 'vitest';

const counts = [ 10, 100, 1_000, 10_000, 100_000, 1_000_000 ];

counts.forEach(count => {
	const arr: string[] = [];
	for (let i = 1; i < count + 1; i++)
		arr.push('x' + i);

	const set = new Set(arr);
	const search = 'x' + count;

	describe(`lookup by val: ${ count }`, () => {
		bench('Array', () => {
			expect(arr.includes(search)).toBeTruthy();
		});

		bench('Set  ', () => {
			expect(set.has(search)).toBeTruthy();
		});
	});
});

counts.forEach(count => {
	const arr: { key: number, value: string }[] = [];
	const map = new Map<number, string>();
	for (let i = 1; i < count + 1; i++) {
		arr.push({ key: i, value: 'x' + i });
		map.set(i, 'x' + i);
	}

	const search = 'x' + count;

	describe(`lookup by key: ${ count }`, () => {
		bench('Array', () => {
			expect(arr.find(v => v.key === count)!.value).toBe(search);
		});

		bench('Map  ', () => {
			expect(map.get(count)).toBe(search);
		});
	});
});
