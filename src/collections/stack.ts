import { type TryResult, tryResult } from '../patterns/try.js';
import { iterateMultiple, type Multiple } from './iteration/multiple.js';
import { type ILinear } from './linear.js';

export class Stack<T> {

	#stack: T[] = [];

	public get count() {
		return this.#stack.length;
	}

	public push(items: Multiple<T>): number {
		let count = 0;

		for (const item of iterateMultiple(items)) {
			this.#stack.push(item);
			count++;
		}

		return count;
	}

	public pop(): T {
		if (this.#stack.length === 0)
			throw new Error('No more items in stack!');

		return this.#stack.pop()!;
	}


	public tryPop(): TryResult<T> {
		if (this.#stack.length === 0)
			return tryResult.fail();

		return tryResult.succeed(this.#stack.pop()!);
	}

	public peek(): T {
		if (this.#stack.length === 0)
			throw new Error('No more items in queue!');

		return this.#stack.at(-1)!;
	}

	public tryPeek(): TryResult<T> {
		if (this.#stack.length === 0)
			return tryResult.fail();

		return tryResult.succeed(this.#stack.at(-1)!);
	}

	public clear(): void {
		this.#stack.length = 0;
	}

}

export class LinearStack<T> extends Stack<T> implements ILinear<T> {

	public attach(items: Multiple<T>): number {
		return super.push(items);
	}

	public detach(): T {
		return super.pop();
	}

	public tryDetach(): TryResult<T> {
		return super.tryPop();
	}

}
