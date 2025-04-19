import { describe, expect, it } from 'vitest';

import { Queue } from './queue.js';
import { range } from './range.js';

describe('queue', () => {
	it('should be first-in-first-out (FIFO)', () => {
		const queue = new Queue<string>();

		queue.enqueue([ 'one', 'two' ]);

		expect(queue.count).toBe(2);

		const a = queue.dequeue();
		const b = queue.dequeue();

		expect(a).toBe('one');
		expect(b).toBe('two');
	});

	it('should handle wrap-around correctly when the buffer is reused', () => {
		const queue = new Queue<number>(4);

		queue.enqueue([ 1, 2, 3, 4 ]);

		expect(queue.count).toBe(4);

		expect(queue.dequeue()).toBe(1);
		expect(queue.dequeue()).toBe(2);

		queue.enqueue([ 5, 6 ]);

		expect(queue.count).toBe(4);

		expect(queue.dequeue()).toBe(3);
		expect(queue.dequeue()).toBe(4);
		expect(queue.dequeue()).toBe(5);
		expect(queue.dequeue()).toBe(6);

		expect(queue.count).toBe(0);
	});

	it('should handle empty state correctly', () => {
		const queue = new Queue<number>();

		expect(queue.count).toBe(0);
		expect(() => queue.dequeue()).toThrow('No more items in queue!');
		expect(() => queue.peek()).toThrow('No more items in queue!');

		queue.enqueue([ 42 ]);

		expect(queue.count).toBe(1);
		expect(queue.peek()).toBe(42);
		expect(queue.dequeue()).toBe(42);

		expect(queue.count).toBe(0);
		expect(() => queue.dequeue()).toThrow('No more items in queue!');
	});

	it('should resize correctly when capacity is exceeded', () => {
		const queue = new Queue<number>(2);

		queue.enqueue([ 1, 2 ]);

		expect(queue.count).toBe(2);

		queue.enqueue([ 3 ]); // Trigger resize

		expect(queue.count).toBe(3);
		expect(queue.dequeue()).toBe(1);
		expect(queue.dequeue()).toBe(2);
		expect(queue.dequeue()).toBe(3);

		expect(queue.count).toBe(0);
	});

	it('should handle enqueueing and dequeueing large numbers of items', () => {
		const queue = new Queue<number>(8);

		const items = range(1, 1000);
		queue.enqueue(items);

		expect(queue.count).toBe(1000);

		for (let i = 1; i <= 1000; i++)
			expect(queue.dequeue()).toBe(i);

		expect(queue.count).toBe(0);
	});

	it('should handle interleaved enqueue and dequeue operations', () => {
		const queue = new Queue<number>(4);

		queue.enqueue([ 1, 2 ]);

		expect(queue.dequeue()).toBe(1);

		queue.enqueue([ 3, 4, 5 ]); // Trigger wrap-around

		expect(queue.dequeue()).toBe(2);
		expect(queue.dequeue()).toBe(3);

		queue.enqueue([ 6 ]);

		expect(queue.dequeue()).toBe(4);
		expect(queue.dequeue()).toBe(5);
		expect(queue.dequeue()).toBe(6);

		expect(queue.count).toBe(0);
	});

	it('should handle wrap-around followed by growth correctly', () => {
		const queue = new Queue<number>(4);

		// Fill the queue to capacity
		queue.enqueue([ 1, 2, 3, 4 ]);

		expect(queue.count).toBe(4);

		// Dequeue two items to create space at the front
		expect(queue.dequeue()).toBe(1);
		expect(queue.dequeue()).toBe(2);

		// Enqueue more items to trigger wrap-around
		queue.enqueue([ 5, 6 ]);

		expect(queue.count).toBe(4);

		// Enqueue additional items to trigger growth
		queue.enqueue([ 7, 8, 9 ]);

		expect(queue.count).toBe(7);

		// Verify the order of items
		expect(queue.dequeue()).toBe(3);
		expect(queue.dequeue()).toBe(4);
		expect(queue.dequeue()).toBe(5);
		expect(queue.dequeue()).toBe(6);
		expect(queue.dequeue()).toBe(7);
		expect(queue.dequeue()).toBe(8);
		expect(queue.dequeue()).toBe(9);

		expect(queue.count).toBe(0);
	});

	it('should handle enqueueing and dequeueing with mixed data types', () => {
		const queue = new Queue<any>();

		queue.enqueue([ 1, 'two', { three: 3 }, [ 4 ] ]);

		expect(queue.count).toBe(4);

		expect(queue.dequeue()).toBe(1);
		expect(queue.dequeue()).toBe('two');
		expect(queue.dequeue()).toEqual({ three: 3 });
		expect(queue.dequeue()).toEqual([ 4 ]);

		expect(queue.count).toBe(0);
	});

	it('should handle clearing the queue', () => {
		const queue = new Queue<number>();

		queue.enqueue([ 1, 2, 3, 4 ]);

		expect(queue.count).toBe(4);

		queue.clear();

		expect(queue.count).toBe(0);
		expect(() => queue.dequeue()).toThrow('No more items in queue!');
	});

	it('should handle concurrent enqueue and dequeue operations', () => {
		const queue = new Queue<number>();

		const enqueueItems = [ 1, 2, 3, 4, 5 ];
		const dequeueResults: number[] = [];

		// Simulate concurrent enqueue and dequeue
		enqueueItems.forEach(item => queue.enqueue([ item ]));
		while (queue.count > 0)
			dequeueResults.push(queue.dequeue());


		expect(dequeueResults).toEqual(enqueueItems);
	});

	it('should handle peeking at an empty queue without modifying state', () => {
		const queue = new Queue<number>();

		expect(() => queue.peek()).toThrow('No more items in queue!');
		expect(queue.count).toBe(0);
	});

	it('should handle enqueueing null or undefined values', () => {
		const queue = new Queue<any>();

		queue.enqueue([ null, undefined ]);

		expect(queue.count).toBe(2);

		expect(queue.dequeue()).toBe(null);
		expect(queue.dequeue()).toBe(undefined);

		expect(queue.count).toBe(0);
	});

	// Skipping this test as it may take a long time to run.
	// Should be run as a performance test separately.
	it.skip('should handle large numbers of enqueue and dequeue operations efficiently', () => {
		const queue = new Queue<number>();

		const largeNumber = 100_000;
		for (let i = 0; i < largeNumber; i++)
			queue.enqueue(i);

		expect(queue.count).toBe(largeNumber);

		for (let i = 0; i < largeNumber; i++)
			expect(queue.dequeue()).toBe(i);

		expect(queue.count).toBe(0);
	});
});
