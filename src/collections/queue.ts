import { type TryResult, tryResult } from '../patterns/try.js';
import { isSomeItem, type Some } from './iteration/some.js';
import { type ILinear } from './linear.js';

/**
 * A resizable FIFO queue backed by a ring buffer.
 *
 * - Amortized O(1) enqueue/dequeue for single items.
 * - O(n) when enqueueing/dequeueing multiple items at once.
 * - Efficient array and set bulk-enqueue with optional reverse order.
 */
export class Queue<T = any> {

	/** The initial capacity. */
	public readonly initialCapacity: number;
	/** The current capacity. */
	public get capacity(): number { return this.buffer.length; }

	/** A monotonically increasing array of items, serving as a ring buffer. */
	private buffer: (T | undefined)[];
	/** The index of the first item in the queue. */
	private head:   number = 0;
	/** The index of the next item to be added to the queue. Can be lower than `head` when wrapping around. */
	private tail:   number = 0;
	/** The number of items in the queue. */
	private num:    number = 0;

	/** The number of items in the queue. */
	public get count(): number { return this.num; }

	/**
	 * Create a new queue.
	 * @param capacity Initial capacity of the underlying buffer (default 16).
	 * @throws Error when capacity < 1.
	 */
	constructor(capacity: number = 16) {
		if (capacity < 1)
			throw new Error('Capacity must be greater than zero!');

		this.initialCapacity = capacity;
		this.buffer = new Array<T>(capacity);
	}

	/**
	 * Enqueue one or more items to the tail of the queue.
	 * @param items A single item, an Array of items, or a Set of items.
	 * @param reverse When true and items is an iterable (Array/Set), insert them in reverse order.
	 * @returns Number of items enqueued.
	 */
	public enqueue(
		items: Some<T>,
		reverse = false,
	): number {
		if (isSomeItem(items)) {
			this.grow(this.num + 1);
			const buffer = this.buffer;
			const bufferLen = buffer.length;
			if (this.tail === bufferLen) {
				buffer[0] = items;
				this.tail = 1;
			}
			else {
				buffer[this.tail++] = items;
			}

			this.num++;

			return 1;
		}

		if (Array.isArray(items)) {
			const length = items.length;
			this.grow(this.num + length);

			const buffer = this.buffer;
			const bufferLen = buffer.length;
			const t0 = this.tail;

			if (reverse) {
				// Place items[i] at descending destination with wrap-around.
				const end = t0 + length;
				let posRw = end - 1;
				if (posRw >= bufferLen)
					posRw %= bufferLen;

				// eslint-disable-next-line @typescript-eslint/prefer-for-of
				for (let i = 0; i < length; i++) {
					buffer[posRw] = items[i];
					posRw--;
					if (posRw < 0)
						posRw = bufferLen - 1;
				}
			}
			else {
				// Place items[i] at ascending destination with wrap-around.
				let posFw = t0;
				// eslint-disable-next-line @typescript-eslint/prefer-for-of
				for (let i = 0; i < length; i++) {
					buffer[posFw] = items[i];
					posFw++;
					if (posFw === bufferLen)
						posFw = 0;
				}
			}

			this.tail = (t0 + length) % bufferLen;
			this.num += length;

			return length;
		}
		else {
			const size = (items as Set<T>).size;
			this.grow(this.num + size);

			const buffer = this.buffer;
			const bufferLen = buffer.length;
			const t0 = this.tail;

			if (reverse) {
				// Write items in reverse order using a local write pointer with wrap-around.
				const end = t0 + size;
				let posRw = end - 1;
				if (posRw >= bufferLen)
					posRw %= bufferLen;

				for (const item of items) {
					buffer[posRw] = item;
					posRw--;
					if (posRw < 0)
						posRw = bufferLen - 1;
				}
			}
			else {
				// Write items in order using a local write pointer with wrap-around.
				let posFw = t0;
				for (const item of items) {
					buffer[posFw] = item;
					posFw++;
					if (posFw === bufferLen)
						posFw = 0;
				}
			}

			this.tail = (t0 + size) % bufferLen;
			this.num += size;

			return size;
		}
	}

	/**
	 * Dequeue item(s) from the head of the queue.
	 * - Without a count, returns a single item.
	 * - With a count, returns an array with that many items.
	 * @param count Optional number of items to dequeue.
	 * @throws Error if empty (no count) or not enough items (with count).
	 */
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

	/**
	 * Try to dequeue item(s) from the head of the queue.
	 * - Without a count, returns TryResult with one item.
	 * - With a count, returns TryResult with an array of items.
	 * @param count Optional number of items to dequeue.
	 */
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

	/**
	 * Peek at the front item(s) without removing them.
	 * - Without a count, returns the front item.
	 * - With a count, returns an array from front forward.
	 * @param count Optional number of items to peek.
	 * @throws Error if empty (no count) or not enough items (with count).
	 */
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
			items.push(this.buffer[((this.head + i) % len)]!);

		return items as any;
	}

	/**
	 * Try to peek at the front item(s) without removing them.
	 * - Without a count, returns TryResult with the front item.
	 * - With a count, returns TryResult with an array from front forward.
	 * @param count Optional number of items to peek.
	 */
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
			items.push(this.buffer[((this.head + i) % len)]!);

		return tryResult.succeed(items) as any;
	}

	/** Clear the queue and reset capacity to the initial capacity. */
	public clear(): void {
		this.buffer = new Array<T>(this.initialCapacity);
		this.head = 0;
		this.tail = 0;
		this.num = 0;
	}

	/**
	 * Ensure capacity for at least the required number of items.
	 * Maintains the logical FIFO order across resizes.
	 * @param requiredCapacity Minimum capacity needed.
	 */
	private grow(requiredCapacity: number): void {
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

/** Linear interface wrapper around Queue providing attach/detach semantics. */
export class LinearQueue<T> extends Queue<T> implements ILinear<T> {

	/** Attach items to the queue (alias for enqueue). */
	public attach(
		items: Some<T>,
		reverse = false,
	): number {
		return super.enqueue(items, reverse);
	}

	/** Detach items from the queue (alias for dequeue). */
	public detach<Count extends number | undefined = undefined>(
		count?: Count,
	): Count extends number ? T[] : T {
		return super.dequeue(count);
	}

	/** Try to detach items from the queue (alias for tryDequeue). */
	public tryDetach<Count extends number | undefined = undefined>(
		count?: Count,
	): TryResult<Count extends number ? T[] : T, string> {
		return super.tryDequeue(count);
	}

}
