import { type TryResult, tryResult } from '../patterns/try.js';
import { isSomeItem, type Some } from './iteration/some.js';
import { type ILinear } from './linear.js';

export class Stack<T = any> {

	/** The initial capacity. */
	private readonly capacity: number;

	/** A monotonically increasing array of items. */
	private buffer: (T | undefined)[];
	/** The number of items in the stack. This is the index of the next item to be added and can be lower than the `buffer.length`. */
	private head:   number = 0;

	/** The number of items in the stack. */
	public get count() { return this.head; }

	constructor(capacity: number = 16) {
		if (capacity < 1)
			throw new Error('Capacity must be greater than zero!');

		this.capacity = capacity;
		this.buffer = new Array<T>(capacity);
	}

	public push(items: Some<T>): number {
		if (isSomeItem(items)) {
			this.grow(this.head + 1);
			this.buffer[this.head++] = items;

			return 1;
		}

		const itemCount = Array.isArray(items) ? items.length : items.size;
		this.grow(this.head + itemCount);
		for (const item of items)
			this.buffer[this.head++] = item;

		return itemCount;
	}

	public pop(): T {
		if (this.head === 0)
			throw new Error('No more items in stack!');

		const item = this.buffer[--this.head]!;
		this.buffer[this.head] = undefined;

		return item;
	}


	public tryPop(): TryResult<T> {
		if (this.head === 0)
			return tryResult.fail();

		const item = this.buffer[--this.head]!;
		this.buffer[this.head] = undefined;

		return tryResult.succeed(item);
	}

	public peek(): T {
		if (this.head === 0)
			throw new Error('No more items in stack!');

		return this.buffer[this.head - 1]!;
	}

	public tryPeek(): TryResult<T> {
		if (this.head === 0)
			return tryResult.fail();

		return tryResult.succeed(this.buffer[this.head - 1]!);
	}

	public clear(): void {
		this.buffer = new Array<T>(this.capacity);
		this.head = 0;
	}

	private grow(requiredCapacity: number): void {
		if (this.buffer.length >= requiredCapacity)
			return;

		let newCapacity = this.buffer.length;
		while (newCapacity < requiredCapacity)
			newCapacity *= 2;

		this.buffer.length = newCapacity;
	}

}

export class LinearStack<T> extends Stack<T> implements ILinear<T> {

	public attach(items: Some<T>): number {
		return super.push(items);
	}

	public detach(): T {
		return super.pop();
	}

	public tryDetach(): TryResult<T> {
		return super.tryPop();
	}

}
