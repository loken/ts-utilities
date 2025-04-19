import { type TryResult } from '../patterns/try.js';
import type { Some } from './iteration/some.js';

export interface ILinear<T> {
	readonly count: number;

	attach(items: Some<T>): number;

	detach<Count extends number | undefined = undefined>(
		count?: Count,
	): Count extends number ? T[] : T;
	tryDetach<Count extends number | undefined = undefined>(
		count?: Count,
	): TryResult<Count extends number ? T[] : T>;

	peek<Count extends number | undefined = undefined>(
		count?: Count,
	): Count extends number ? T[] : T;
	tryPeek<Count extends number | undefined = undefined>(
		count?: Count,
	): TryResult<Count extends number ? T[] : T>;
	clear(): void;

}
