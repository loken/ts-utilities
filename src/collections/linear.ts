import { type TryResult } from '../patterns/try.js';
import type { Some } from './iteration/some.js';

/**
 * A unified interface for linear data structures (stack/queue) with attach/detach semantics.
 *
 * Implementations include `LinearStack<T>` and `LinearQueue<T>`.
 */
export interface ILinear<T> {
	/** Current number of items. */
	readonly count: number;

	/**
	 * Attach one or more items.
	 * - Accepts a single item, an Array of items, or a Set of items.
	 * - For Arrays/Sets, pass reverse=true to attach in reverse order.
	 * @returns Number of items attached.
	 */
	attach(items: Some<T>, reverse?: boolean): number;

	/**
	 * Detach one or more items.
	 * - Without a count, detaches and returns a single item.
	 * - With a count, detaches that many items and returns them as an array.
	 * @throws Error if empty (no count) or not enough items (with count).
	 */
	detach<Count extends number | undefined = undefined>(
		count?: Count,
	): Count extends number ? T[] : T;

	/** Try to detach item(s); returns a TryResult instead of throwing. */
	tryDetach<Count extends number | undefined = undefined>(
		count?: Count,
	): TryResult<Count extends number ? T[] : T, string>;

	/**
	 * Peek at the next item(s) without removing them.
	 * - Without a count, returns a single item.
	 * - With a count, returns an array of items.
	 * @throws Error if empty (no count) or not enough items (with count).
	 */
	peek<Count extends number | undefined = undefined>(
		count?: Count,
	): Count extends number ? T[] : T;

	/** Try variant of peek; returns a TryResult instead of throwing. */
	tryPeek<Count extends number | undefined = undefined>(
		count?: Count,
	): TryResult<Count extends number ? T[] : T, string>;

	/** Remove all items and reset to initial state. */
	clear(): void;

}
