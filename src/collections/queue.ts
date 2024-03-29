import { type TryResult, tryResult } from '../patterns/try.js';
import { type Some, someToIterable } from './iteration/some.js';
import { type ILinear } from './linear.js';

export class Queue<T> {

	#queue = new Map<number, T>();
	#head = 0;
	#tail = 0;

	public get count() {
		return this.#tail - this.#head;
	}

	public enqueue(items: Some<T>): number {
		let count = 0;

		for (const item of someToIterable(items)) {
			this.#queue.set(this.#tail++, item);
			count++;
		}

		return count;
	}

	public dequeue(): T {
		if (this.#tail === this.#head)
			throw new Error('No more items in queue!');

		const item = this.#queue.get(this.#head)!;
		this.#queue.delete(this.#head++);

		return item;
	}

	public tryDequeue(): TryResult<T> {
		if (this.#tail === this.#head)
			return tryResult.fail();

		const item = this.#queue.get(this.#head)!;
		this.#queue.delete(this.#head++);

		return tryResult.succeed(item);
	}

	public peek(): T {
		if (this.#tail === this.#head)
			throw new Error('No more items in queue!');

		return this.#queue.get(this.#head)!;
	}

	public tryPeek(): TryResult<T> {
		if (this.#tail === this.#head)
			return tryResult.fail();

		return tryResult.succeed(this.#queue.get(this.#head)!);
	}

	public clear(): void {
		this.#queue.clear();
		this.#head = 0;
		this.#tail = 0;
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
