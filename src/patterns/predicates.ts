/**
 * Predicate which determines whether the `item` is a match.
 *
 * Note: You're allowed to not return anything, which allow you to be more expressive,
 * focussing only on the positive match.
 */
export type Predicate<T> = (item: T) => boolean | void;

/**
 * Predicate which determines whether the `item` is a match
 * and narrows the type of the `item` when it is.
 *
 * Note: This sort of predicate is useful when you want to narrow the type of the `item`.
 */
export type TypeGuard<T, U extends T> = (item: T) => item is U;
