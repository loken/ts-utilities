import { expect, test } from 'vitest';

import { type Maybe, mayGet, mayResolve } from './maybe.js';


test('Maybe returns minimal number of segments', () => {
	const getLessThan10 = (num: number): Maybe<number, string> => {
		return num < 10
			? [ num ]
			: [ undefined, 'too large' ];
	};

	expect(getLessThan10(5)).toEqual([ 5 ]);
	expect(getLessThan10(10)).toEqual([ undefined, 'too large' ]);

	// Assert that the destructured variables have the correctly narrowed types:
	const [ val, error ] = getLessThan10(5);
	if (typeof val === 'number') {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const v: number = val;
	}
	else {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const err: string = error;
	}
});

test('mayGet', () => {
	const getLessThan10 = (num: number): number => {
		if (num < 10)
			return num;

		throw 'too large';
	};

	expect(mayGet(() => getLessThan10(5))).toEqual([ 5 ]);
	expect(mayGet(() => getLessThan10(10))).toEqual([ undefined, 'too large' ]);
});

test('mayResolve', async () => {
	const getLessThan10 = (num: number): Promise<number> => {
		if (num < 10)
			return Promise.resolve(num);

		return Promise.reject('too large');
	};

	expect(await mayResolve(getLessThan10(5))).toEqual([ 5 ]);
	expect(await mayResolve(getLessThan10(10))).toEqual([ undefined, 'too large' ]);
});
