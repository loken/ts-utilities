/**
 * Benchmark showing that generators have so much overhead that
 * unless you have a really large number of items, just using arrays is faster.
 *
 * This does not measure the memory benefits of using generators, though.
 * If you aren't concerned with memory or need to delay consumption of items,
 * you should probably just use arrays. Perhaps with future optimizations this
 * will be different.
 */
import { bench, describe, expect } from 'vitest';

const counts = [ 10, 100, 1_000, 10_000, 100_000, 1_000_000 ];

counts.forEach(count => {
	describe(`Into array: ${ count }`, () => {
		bench('Sequence', () => {
			const arr = [ ...generateSequence(count) ];
			expect(arr.length).toBe(count);
		});

		bench('Array   ', () => {
			const arr = generateArray(count);
			expect(arr.length).toBe(count);
		});
	});
});

counts.forEach(count => {
	describe(`Iterated: ${ count }`, () => {
		bench('Sequence', () => {
			let last = NaN;
			for (const i of generateSequence(count))
				last = i;

			expect(last).toBe(count - 1);
		});

		bench('Array   ', () => {
			let last = NaN;
			for (const i of generateArray(count))
				last = i;

			expect(last).toBe(count - 1);
		});
	});
});

function *generateSequence(count: number) {
	for (let i = 0; i < count; i++)
		yield i;
}

function generateArray(count: number) {
	const result: number[] = [];
	for (let i = 0; i < count; i++)
		result.push(i);

	return result;
}
