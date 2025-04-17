import { type TryResult, tryResult } from '../patterns/try.js';
import { addSome, type Some } from './iteration/some.js';
import { type ILinear } from './linear.js';

export class Queue<T> {

	public static cleanupThreshold = 4096;

	#queue: T[] = [];
	#head = 0;

	public get count() {
		return this.#queue.length - this.#head;
	}

	public enqueue(items: Some<T>): number {
		const len = this.#queue.length;

		addSome(this.#queue, items);

		return this.#queue.length - len;
	}

	public dequeue(): T {
		if (this.#queue.length === this.#head)
			throw new Error('No more items in queue!');

		const item = this.#queue.at(this.#head)!;
		delete this.#queue[this.#head++];

		if (this.#head >= Queue.cleanupThreshold) {
			this.#queue = this.#queue.slice(this.#head);
			this.#head = 0;
		}

		return item;
	}

	public tryDequeue(): TryResult<T> {
		if (this.#queue.length === this.#head)
			return tryResult.fail();

		const item = this.#queue.at(this.#head)!;
		delete this.#queue[this.#head++];

		if (this.#head >= Queue.cleanupThreshold) {
			this.#queue = this.#queue.slice(this.#head);
			this.#head = 0;
		}

		return tryResult.succeed(item);
	}

	public peek(): T {
		if (this.#queue.length === this.#head)
			throw new Error('No more items in queue!');

		return this.#queue.at(this.#head)!;
	}

	public tryPeek(): TryResult<T> {
		if (this.#queue.length === this.#head)
			return tryResult.fail();

		return tryResult.succeed(this.#queue.at(this.#head)!);
	}

	public clear(): void {
		this.#queue.length = 0;
		this.#head = 0;
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
