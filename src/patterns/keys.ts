/** Union of the keys of `T` which is of type `Value`. */
export type KeyOf<T extends object, Value> = _KeyOf<Required<T>, Value>;

type _KeyOf<T extends object, Value> = {
	[key in keyof T]: T[key] extends Value ? key : never;
}[keyof T];
