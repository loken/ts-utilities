import { type TryResult, tryResult } from '../patterns/try.js';
import { isSomeItem, type Some } from './iteration/some.js';
import { type ILinear } from './linear.js';

export class Queue<T> {

	/** The initial capacity. */
	private readonly capacity: number;

	/** A monotonically increasing array of items, serving as a ring buffer. */
	private buffer: (T | undefined)[];
	/** The index of the first item in the queue. */
	private head:   number = 0;
	/** The index of the next item to be added to the queue. Can be lower than `head` when wrapping around. */
	private tail:   number = 0;
	/** The number of items in the queue. */
	private num:    number = 0;

	/** The number of items in the queue. */
	public get count() { return this.num; }

	constructor(capacity: number = 16) {
		if (capacity < 1)
			throw new Error('Capacity must be greater than zero!');

		this.capacity = capacity;
		this.buffer = new Array<T>(capacity);
	}

	public enqueue(items: Some<T>): number {
		if (isSomeItem(items)) {
			this.grow(this.num + 1);
			if (this.tail === this.buffer.length) {
				this.buffer[0] = items;
				this.tail = 1;
			}
			else {
				this.buffer[this.tail++] = items;
			}

			this.num++;

			return 1;
		}

		const itemCount = Array.isArray(items) ? items.length : items.size;
		this.grow(this.num + itemCount);
		for (const item of items) {
			if (this.tail === this.buffer.length) {
				this.buffer[0] = item;
				this.tail = 1;
			}
			else {
				this.buffer[this.tail++] = item;
			}
		}

		this.num += itemCount;

		return itemCount;
	}

	public dequeue(): T {
		if (this.num === 0)
			throw new Error('No more items in queue!');

		const item = this.buffer[this.head]!;
		this.buffer[this.head++] = undefined;

		this.num--;

		if (this.num === 0) {
			this.head = 0;
			this.tail = 0;
		}

		return item;
	}

	public tryDequeue(): TryResult<T> {
		if (this.num === 0)
			return tryResult.fail();

		const item = this.buffer[this.head]!;
		this.buffer[this.head++] = undefined;

		this.num--;

		if (this.num === 0) {
			this.head = 0;
			this.tail = 0;
		}

		return tryResult.succeed(item);
	}

	public peek(): T {
		if (this.num === 0)
			throw new Error('No more items in queue!');

		return this.buffer[this.head]!;
	}

	public tryPeek(): TryResult<T> {
		if (this.num === 0)
			return tryResult.fail();

		return tryResult.succeed(this.buffer[this.head]!);
	}

	public clear(): void {
		this.buffer = new Array<T>(this.capacity);
		this.head = 0;
		this.tail = 0;
		this.num = 0;
	}

	private grow(requiredCapacity: number) {
		if (this.buffer.length >= requiredCapacity)
			return;

		let newCapacity = this.buffer.length;
		while (newCapacity < requiredCapacity)
			newCapacity *= 2;

		if (this.tail < this.head) {
			// When we have wrapped around the buffer, we need to copy the items to a new buffer,
			// and move the wrapped items to the end of the new buffer.
			const newBuffer = new Array<T>(newCapacity);

			const headToEndCount = this.buffer.length - this.head;
			for (let i = this.head; i < this.buffer.length; i++)
				newBuffer[i - this.head] = this.buffer[i]!;
			for (let i = 0; i < this.tail; i++)
				newBuffer[i + headToEndCount] = this.buffer[i]!;

			this.buffer = newBuffer;
			this.tail += headToEndCount;
			this.head = 0;
		}
		else {
			// Otherwise we can just resize the buffer.
			// The engine is likely to internally assign new memory,
			// but it may not, and allowing the engine to optimize this is better.
			this.buffer.length = newCapacity;
		}
	}

}

export class LinearQueue<T> extends Queue<T> implements ILinear<T> {

	public attach(items: Some<T>): number {
		return super.enqueue(items);
	}

	public detach(): T {
		return super.dequeue();
	}

	public tryDetach(): TryResult<T> {
		return super.tryDequeue();
	}

}
