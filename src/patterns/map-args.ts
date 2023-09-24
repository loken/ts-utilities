import type { ItemOfList } from '../collections/item-of-list.js';


/**
 * Maps Args of various lengths to different data structures:
 * - length = 0: `never` when AllowEmpty=false (default) and otherwise `undefined`.
 * - length = 1: `V`
 * - length > 1: `V[]` when AsTuple=false (default) and otherwise tuple of `V` of the same length.
 */
export type MapArgs<Args extends readonly any[], V, AsTuple extends boolean = false, AllowEmpty = false> =
	Args['length'] extends 0
		? AllowEmpty extends true
			? undefined
			: never
		: Args['length'] extends 1
			? V
			: AsTuple extends false
				? V[]
				: { [K in keyof Args]: V };


/**
 * Map `Args` of various lengths to different data structures using the `transform` function.
 * - length = 0: `never` when `allowEmpty`=false and otherwise `undefined`.
 * - length = 1: `V`
 * - length > 1: `V[]` when `asTuple`=false and otherwise tuple of `V` of the same length.
 *
 * @param args The list of arguments.
 * @param transform The transform function to use when mapping the args. The item type is inferred from its return type.
 * @param asTuple Return a fixed length tuple (true) or an array (default: false)?
 * @param allowEmpty Throw an exception when Args.length is 0 (default: false) or return undefined (true)?
 */
export const mapArgs = <
	Args extends any[],
	Transform extends (item: ItemOfList<Args>) => unknown,
	AsTuple extends boolean = false,
	AllowEmpty extends boolean = false,
>(
	args: Args,
	transform: Transform,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	asTuple: AsTuple = false as AsTuple,
	allowEmpty: AllowEmpty = false as AllowEmpty,
): MapArgs<Args, ReturnType<Transform>, AsTuple, AllowEmpty> => {
	if (args.length === 0) {
		if (allowEmpty)
			return undefined as any;
		else
			throw new Error('Must provide at least one argument.');
	}

	if (args.length === 1)
		return transform(args[0]!) as any;

	return args.map(transform) as any;
};
