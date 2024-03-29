import { type TryResult } from '../patterns/try.js';
import type { Some } from './iteration/some.js';

export interface ILinear<T> {
	readonly count: number;
	attach(items: Some<T>): number;
	detach(): T;
	tryDetach(): TryResult<T>;
	peek(): T;
	tryPeek(): TryResult<T>;
	clear(): void;

}
