import { describe, expect, it } from 'vitest';

import { Queue } from './queue.js';
import { range } from './range.js';

describe('queue', () => {
	it('should be first-in-first-out (FIFO)', () => {
		const queue = new Queue<string>();

		queue.enqueue('one');
		queue.enqueue('two');

		expect(queue.count).toBe(2);

		const a = queue.dequeue();
		const b = queue.dequeue();

		expect(a).toBe('one');
		expect(b).toBe('two');
	});

	it('should be able to grow when the tail is before the head of the queue buffer.', () => {
		const queue = new Queue<string>(16);

		const items = range(1, 16).map(i => 'item ' + i);

		queue.enqueue(items);

		expect(queue.count).toBe(16);

		expect(queue.peek()).toBe('item 1');
		expect(queue.dequeue()).toBe('item 1');
		expect(queue.peek()).toBe('item 2');
		expect(queue.dequeue()).toBe('item 2');

		queue.enqueue('front fill');

		const moreItems = range(17, 5).map(i => 'item ' + i);

		// Here we are testing the grow function of the queue
		// by adding more items than the initial capacity of 16
		// after we have already dequeued 2 items and added 1 item,
		// meaning there is 1 item at index 0, then a gap and then the remaining items.
		queue.enqueue(moreItems);

		expect(queue.count).toBe(20);

		expect(queue.peek()).toBe('item 3');
		expect(queue.dequeue()).toBe('item 3');
		expect(queue.peek()).toBe('item 4');
		expect(queue.dequeue()).toBe('item 4');
	});
});
