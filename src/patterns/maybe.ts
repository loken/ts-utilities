/**
 * Result from functions which may return a `value` or an `error`.
 *
 * When the `Value` and `Error` may be `undefined` this is not a good fit since
 * you can't easily find out if the result is for the success or failure case.
 * Instead, use `TryResult` for those scenarios.
 */
export type Maybe<Val, Error = unknown> =
	| readonly [value: Val,       error?: never]
	| readonly [value: undefined, error:  Error];


/**
 * Executes the `func` and either return its result,
 * or handle and return the exception if it throws.
 */
export const mayGet = <Val, Error = unknown>(
	func: () => Val,
	catchCb?: (error: unknown) => Error,
	finallyCb?: () => any,
): Maybe<Val, Error> => {
	try {
		const data = func();

		return [ data ];
	}
	catch (error) {
		return [ undefined, catchCb ? catchCb(error) : error as Error ];
	}
	finally {
		finallyCb?.();
	}
};

/**
 * Await the `promise` and either return its resolved value,
 * or handle and return the exception if it is rejected.
 */
export const mayResolve = async <Val, Error = unknown>(
	promise: Promise<Val>,
	catchCb?: (error: unknown) => Error,
	finallyCb?: () => any,
): Promise<Maybe<Val, Error>> => {
	try {
		const data = await promise;

		return [ data ];
	}
	catch (error) {
		return [ undefined, catchCb ? catchCb(error) : error as Error ];
	}
	finally {
		finallyCb?.();
	}
};
