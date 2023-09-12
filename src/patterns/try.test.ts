import { expect, test } from 'vitest';

import { type TryResult, tryResult } from './try.js';


test('TryResult without reason have 2 segments', () => {
	const tryLessThan10 = (num: number): TryResult<number> => {
		return num < 10
			? tryResult.succeed(num)
			: tryResult.fail();
	};

	expect(tryLessThan10(5)).toEqual([ 5, true ]);
	expect(tryLessThan10(10)).toEqual([ undefined, false ]);
});

test('TryResult with reasons have a 3rd segment for failure reason', () => {
	const tryLessThan10 = (num: number): TryResult<number, string[]> => {
		return num < 10
			? tryResult.succeed(num)
			: tryResult.fail([ 'multiple', 'reasons' ]);
	};

	expect(tryLessThan10(5)).toEqual([ 5, true ]);
	expect(tryLessThan10(10)).toEqual([ undefined, false, [ 'multiple', 'reasons' ] ]);
});


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const incorrectUseWithoutReason: Record<string, TryResult<number>> = {
	// @ts-expect-error
	mustPassValueToSucceed: tryResult.succeed(),
	// @ts-expect-error
	cannotPassValueToFail:  tryResult.fail('thing'),

};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const incorrectUseWithReason: Record<string, string[]> = {
	// @ts-expect-error
	mustPassValueToSucceed:      tryResult.succeed(),
	// @ts-expect-error
	msgSucceedIncompatibleValue: tryResult.succeed('val'),
	// @ts-expect-error
	msgFailMustPassReason:       tryResult.fail(),
	// @ts-expect-error
	msgFailIncompatibleReason:   tryResult.fail(10),
};
