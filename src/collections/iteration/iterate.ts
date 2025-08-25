/**
 * Iterate through all items in the `iterable`.
 *
 * Useful when iterating has side effects and you don't want to
 * create a throwaway collection for the results.
 */
export const iterateAll = <T>(iterable: IterableIterator<T>): void => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	for (const _ of iterable) {
		// Do nothing.
	}

	return;
};
