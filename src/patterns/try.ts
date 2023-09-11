/**
 * Result from try* functions where the `value` is narrowed to
 * `T` or `undefined` depending on the value of `success`.
 */
export type TryResult<Val = any, Reason = never> =
	readonly [ value: Val, success: true] |
	([Reason] extends [never]
		? readonly [ value: undefined, success: false ]
		: readonly [ value: undefined, success: false, reason: Reason ]);

/**
 * Factory for creating `TryResult`s.
 */
export const tryResult = Object.freeze({
	/** Create a failed `TryResult` with or without a `reason`. */
	fail: <Reason = never>(reason?: Reason) => reason === undefined
		? Object.freeze([ undefined, false, reason ]) as TryResult<any, Reason>
		: Object.freeze([ undefined, false ]) as TryResult<any, Reason>,

	/** Create a successful `TryResult<T>` containing the `value`. */
	succeed: <Val>(value: Val) => Object.freeze([ value, true ]) as TryResult<Val>,
});
