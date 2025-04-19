import { type TryResult, tryResult } from '../patterns/try.js';
import { isSomeItem, type Some } from './iteration/some.js';
import { type ILinear } from './linear.js';

export class Queue<T = any> {

	/** The initial capacity. */
	public readonly initialCapacity: number;
	/** The current capacity. */
	public get capacity() { return this.buffer.length; }

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

		this.initialCapacity = capacity;
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

	public dequeue<Count extends number | undefined = undefined>(
		count?: Count,
	): Count extends number ? T[] : T {
		if (count === undefined) {
			if (this.num === 0)
				throw new Error('No more items in queue!');

			const item = this.buffer[this.head]!;
			this.buffer[this.head++] = undefined;

			this.num--;

			if (this.num === 0) {
				this.head = 0;
				this.tail = 0;
			}
			else if (this.head === this.buffer.length) {
				this.head = 0;
			}

			return item as any;
		}

		if (count > this.num)
			throw new Error('Not enough items in queue!');

		const items: T[] = [];
		for (let i = 0; i < count; i++) {
			items.push(this.buffer[this.head]!);
			this.buffer[this.head++] = undefined;

			if (this.head === this.buffer.length)
				this.head = 0;
		}

		this.num -= count;

		if (this.num === 0) {
			this.head = 0;
			this.tail = 0;
		}

		return items as any;
	}

	public tryDequeue<Count extends number | undefined = undefined>(
		count?: Count,
	): TryResult<Count extends number ? T[] : T, string> {
		if (count === undefined) {
			if (this.num === 0)
				return tryResult.fail('No more items in queue!');

			const item = this.buffer[this.head]!;
			this.buffer[this.head++] = undefined;

			this.num--;

			if (this.num === 0) {
				this.head = 0;
				this.tail = 0;
			}
			else if (this.head === this.buffer.length) {
				this.head = 0;
			}

			return tryResult.succeed(item) as any;
		}

		if (count > this.num)
			return tryResult.fail('Not enough items in queue!');

		const items: T[] = [];
		for (let i = 0; i < count; i++) {
			items.push(this.buffer[this.head]!);
			this.buffer[this.head++] = undefined;

			if (this.head === this.buffer.length)
				this.head = 0;
		}

		this.num -= count;

		if (this.num === 0) {
			this.head = 0;
			this.tail = 0;
		}

		return tryResult.succeed(items) as any;
	}

	public peek<Count extends number | undefined = undefined>(
		count?: Count,
	): Count extends number ? T[] : T {
		if (count === undefined) {
			if (this.num === 0)
				throw new Error('No more items in queue!');

			return this.buffer[this.head]! as any;
		}

		if (count > this.num)
			throw new Error('Not enough items in queue!');

		const items: T[] = [];
		const len = this.buffer.length;
		for (let i = 0; i < count; i++)
			items.push(this.buffer[(this.head + i % len)]!);

		return items as any;
	}

	public tryPeek<Count extends number | undefined = undefined>(
		count?: Count,
	): TryResult<Count extends number ? T[] : T, string> {
		if (count === undefined) {
			if (this.num === 0)
				return tryResult.fail('No more items in queue!');

			return tryResult.succeed(this.buffer[this.head]!) as any;
		}

		if (count > this.num)
			return tryResult.fail('Not enough items in queue!');

		const items: T[] = [];
		const len = this.buffer.length;
		for (let i = 0; i < count; i++)
			items.push(this.buffer[(this.head + i % len)]!);

		return tryResult.succeed(items) as any;
	}

	public clear(): void {
		this.buffer = new Array<T>(this.initialCapacity);
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

		const newBuffer = new Array<T>(newCapacity);

		if (this.num === 0) {
			this.tail = 0;
		}
		else if (this.tail <= this.head) {
			// When the buffer wraps around, copy items in two parts:
			// 1. From `head` to the end of the buffer
			// 2. From the start of the buffer to `tail`
			const headToEndCount = this.buffer.length - this.head;
			for (let i = 0; i < headToEndCount; i++)
				newBuffer[i] = this.buffer[this.head + i]!;
			for (let i = 0; i < this.tail; i++)
				newBuffer[headToEndCount + i] = this.buffer[i]!;
			this.tail = headToEndCount + this.tail;
		}
		else {
			// When the buffer does not wrap around, copy items directly
			for (let i = 0; i < this.num; i++)
				newBuffer[i] = this.buffer[this.head + i]!;
			this.tail = this.num;
		}

		this.head = 0;
		this.buffer = newBuffer;
	}

}

export class LinearQueue<T> extends Queue<T> implements ILinear<T> {

	public attach(items: Some<T>): number {
		return super.enqueue(items);
	}

	public detach<Count extends number | undefined = undefined>(
		count?: Count,
	): Count extends number ? T[] : T {
		return super.dequeue(count);
	}

	public tryDetach<Count extends number | undefined = undefined>(
		count?: Count,
	): TryResult<Count extends number ? T[] : T, string> {
		return super.tryDequeue(count);
	}

}
