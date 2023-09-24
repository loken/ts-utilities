import { expect, test } from 'vitest';

import { mapArgs } from './map-args.js';


const mapPrefixTuple = <Args extends number[]>(prefix: string, ...args: Args) => {
	return mapArgs(args, arg => `${ prefix }-${ arg }`, true, false);
};

const mapPrefixList = <Args extends number[]>(prefix: string, ...args: Args) => {
	return mapArgs(args, arg => `${ prefix }-${ arg }`, false, false);
};


test('Can map to a tuple so we can easily destructure each mapped item', () => {
	// eslint-disable-next-line prefer-const
	let [ a, b, c ] = mapPrefixTuple('pre', 1, 2, 3);

	expect(a).toEqual('pre-1');
	expect(b).toEqual('pre-2');
	expect(c).toEqual('pre-3');

	// 'a' is a string not a string | undefined so we should not be able to assign undefined to it.
	// @ts-expect-error
	a = undefined;
});

test('Can map to a list', () => {
	// eslint-disable-next-line prefer-const
	const list = mapPrefixList('pre', 1, 2, 3);

	expect(list).toEqual([
		'pre-1',
		'pre-2',
		'pre-3',
	]);

	let [ a ] = list;

	// Since the list doesn't know how many items it has, destructuring from it
	// means a is of type string | undefined, and so we can assign undefined to it, unlike for tuples.
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	a = undefined;
});
