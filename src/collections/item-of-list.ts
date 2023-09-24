/**
 * Get the type of items in the `List`.
 *
 * Optionally you can apply a `Constraint` for the item type.
 * If the constraint is not met `never` is returned instead of the item type..
 */
export type ItemOfList<List extends any[], Constraint = unknown> = List extends (infer Item)[]
	? Item extends Constraint
		? Item & Constraint
		: never
	: never;
