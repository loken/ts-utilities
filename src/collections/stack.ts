import { type TryResult, tryResult } from '../patterns/try.js';
import { isSomeItem, type Some } from './iteration/some.js';
import { type ILinear } from './linear.js';

/**
 * A resizable LIFO stack backed by an array buffer.
 *
 * - Amortized O(1) push/pop for single items.
 * - O(n) when pushing multiple items at once.
 * - Supports pushing Arrays and Sets efficiently, with optional reverse order.
 */
export class Stack<T = any> {

	/** The initial capacity. */
	public readonly initialCapacity: number;
	/** The current capacity. */
	public get capacity(): number { return this.buffer.length; }

	/** A monotonically increasing array of items. */
	private buffer: (T | undefined)[];
	/** The number of items in the stack. This is the index of the next item to be added and can be lower than the `buffer.length`. */
	private head:   number = 0;

	/** The number of items in the stack. */
	public get count(): number { return this.head; }

	/**
	 * Create a new stack.
	 * @param capacity Initial capacity of the underlying buffer (default: 16).
	 * @throws Error when capacity < 1.
	 */
	constructor(capacity: number = 16) {
		if (capacity < 1)
			throw new Error('Capacity must be greater than zero!');

		this.initialCapacity = capacity;
		this.buffer = new Array<T>(capacity);
	}

	/**
	 * Push one or more items onto the stack.
	 * @param items A single item, an Array of items, or a Set of items.
	 * @param reverse When true and items is an iterable (Array/Set), insert them in reverse order.
	 * @returns The number of items pushed.
	 */
	public push(
		items: Some<T>,
		reverse = false,
	): number {
		const buffer = this.buffer;
		const h0 = this.head;

		if (isSomeItem(items)) {
			this.grow(h0 + 1);
			buffer[this.head++] = items;

			return 1;
		}

		if (Array.isArray(items)) {
			const length = items.length;
			this.grow(h0 + length);

			if (reverse) {
				// Place items[i] at descending destination.
				const last = h0 + length - 1;
				for (let i = 0; i < length; i++)
					buffer[last - i] = items[i];
				this.head = h0 + length;
			}
			else {
				// Place items[i] at ascending destination.
				for (let i = 0; i < length; i++)
					buffer[h0 + i] = items[i];
				this.head = h0 + length;
			}

			return length;
		}
		else {
			const size = items.size;
			this.grow(h0 + size);

			if (reverse) {
				// Write items in reverse order using a local write pointer.
				const end = h0 + size;
				let posRw = end - 1;
				for (const item of items)
					buffer[posRw--] = item;
				this.head = end;
			}
			else {
				// Write items in order using a local write pointer.
				let posFw = h0;
				for (const item of items)
					buffer[posFw++] = item;
				this.head = posFw;
			}

			return size;
		}
	}

	/**
	 * Pop one or more items off the stack.
	 * - Without a count, pops and returns a single item.
	 * - With a count, pops that many items and returns them in LIFO order as an array.
	 * @param count Optional number of items to pop.
	 * @throws Error when popping from an empty stack or not enough items are present.
	 */
	public pop<Count extends number | undefined = undefined>(
		count?: Count,
	): Count extends number ? T[] : T {
		if (count === undefined) {
			if (this.head === 0)
				throw new Error('No more items in stack!');

			const item = this.buffer[--this.head]!;
			this.buffer[this.head] = undefined;

			return item as any;
		}

		if (count > this.head)
			throw new Error('Not enough items in stack!');

		const items: T[] = [];
		for (let i = 0; i < count; i++) {
			items.push(this.buffer[--this.head]!);
			this.buffer[this.head] = undefined;
		}

		return items as any;
	}

	/**
	 * Try to pop one or more items off the stack.
	 * - Without a count, returns TryResult with a single item or an error message.
	 * - With a count, returns TryResult with an array of items or an error message.
	 * @param count Optional number of items to pop.
	 */
	public tryPop<Count extends number | undefined = undefined>(
		count?: Count,
	): TryResult<Count extends number ? T[] : T, string> {
		if (count === undefined) {
			if (this.head === 0)
				return tryResult.fail('No more items in stack!');

			const item = this.buffer[--this.head]!;
			this.buffer[this.head] = undefined;

			return tryResult.succeed(item) as any;
		}

		if (count > this.head)
			return tryResult.fail('Not enough items in stack!');

		const items: T[] = [];
		for (let i = 0; i < count; i++) {
			items.push(this.buffer[--this.head]!);
			this.buffer[this.head] = undefined;
		}

		return tryResult.succeed(items) as any;
	}

	/**
	 * Peek at the top item(s) of the stack without removing them.
	 * - Without a count, returns the top item.
	 * - With a count, returns an array of items from top down.
	 * @param count Optional number of items to peek.
	 * @throws Error when peeking an empty stack or requesting more than available.
	 */
	public peek<Count extends number | undefined = undefined>(
		count?: Count,
	): Count extends number ? T[] : T {
		if (count === undefined) {
			if (this.head === 0)
				throw new Error('No more items in stack!');

			return this.buffer[this.head - 1]! as any;
		}

		if (count > this.head)
			throw new Error('Not enough items in stack!');

		const items: T[] = [];
		for (let i = 0; i < count; i++)
			items.unshift(this.buffer[this.head - 1 - i]!);

		return items as any;
	}

	/**
	 * Try to peek at the top item(s) of the stack without removing them.
	 * - Without a count, returns TryResult with the top item or an error message.
	 * - With a count, returns TryResult with an array of items or an error message.
	 * @param count Optional number of items to peek.
	 */
	public tryPeek<Count extends number | undefined = undefined>(
		count?: Count,
	): TryResult<Count extends number ? T[] : T, string> {
		if (count === undefined) {
			if (this.head === 0)
				return tryResult.fail('No more items in stack!');

			return tryResult.succeed(this.buffer[this.head - 1]!) as any;
		}

		if (count > this.head)
			return tryResult.fail('Not enough items in stack!');

		const items: T[] = [];
		for (let i = 0; i < count; i++)
			items.unshift(this.buffer[this.head - 1 - i]!);

		return tryResult.succeed(items) as any;
	}

	/** Clear the stack and reset capacity to the initial capacity. */
	public clear(): void {
		this.buffer = new Array<T>(this.initialCapacity);
		this.head = 0;
	}

	/**
	 * Ensure the buffer can hold at least requiredCapacity items, doubling as needed.
	 * @param requiredCapacity Required minimum capacity.
	 */
	private grow(requiredCapacity: number): void {
		if (this.buffer.length >= requiredCapacity)
			return;

		let newCapacity = this.buffer.length;
		while (newCapacity < requiredCapacity)
			newCapacity *= 2;

		this.buffer.length = newCapacity;
	}

}

/**
 * Linear interface wrapper around Stack.
 * Provides attach/detach operations matching ILinear.
 */
export class LinearStack<T> extends Stack<T> implements ILinear<T> {

	/** Attach items to the stack (alias for push). */
	public attach(
		items: Some<T>,
		reverse = false,
	): number {
		return super.push(items, reverse);
	}

	/** Detach items from the stack (alias for pop). */
	public detach<Count extends number | undefined = undefined>(
		count?: Count,
	): Count extends number ? T[] : T {
		return super.pop(count);
	}

	/** Try to detach items from the stack (alias for tryPop). */
	public tryDetach<Count extends number | undefined = undefined>(
		count?: Count,
	): TryResult<Count extends number ? T[] : T, string> {
		return super.tryPop(count);
	}

}
