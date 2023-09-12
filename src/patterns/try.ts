/**
 * Result from try* functions where the `value` is narrowed to
 * `Val` or `undefined` depending on the value of `success`.
 *
 * Optionally a strongly typed `reason` for failure may be given.
 */
export type TryResult<Val, Reason = never> =
	| TrySuccess<Val>
	| ([Reason] extends [never]
		? TryFailure
		: TryError<Reason>);

/** The result when a try* function succeeds. */
export type TrySuccess<Val>  = readonly [ value: Val, success: true];

/** The result when a try* function fails without a reason. */
export type TryFailure       = readonly [ value: undefined, success: false ];

/** The result when a try* function fails with a reason. */
export type TryError<Reason> = readonly [ value: undefined, success: false, reason: Reason ];


/**
 * Factory for creating `TryResult`s.
 */
export const tryResult = Object.freeze({
	/** Create a successful `TryResult<T>` containing the `value`. */
	succeed: tryResultSucceed,

	/** Create a failed `TryResult` with or without a `reason`. */
	fail: tryResultFail,
});


function tryResultSucceed<Val>(value: Val): TrySuccess<Val> {
	return Object.freeze([ value, true ]);
}

function tryResultFail(): TryFailure;
function tryResultFail<Reason>(reason: Reason): TryError<Reason>;
function tryResultFail(reason?: any) {
	return reason !== undefined
		? Object.freeze([ undefined, false, reason ])
		: Object.freeze([ undefined, false ]);
}
