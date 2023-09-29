import { assert, test } from 'vitest';

import { randomInt, randomNumber } from './random';


test('randomNumber generates a number within the specified range', () => {
	const num = randomNumber(4, 8);
	assert(num >= 4 && num < 8);
});

test('randomInt generates an integer within the specified range', () => {
	const int = randomInt(4, 8);
	assert(Number.isInteger(int) && int >= 4 && int < 8);
});


test('randomNumber throws an error if max is not larger than min', () => {
	assert.throws(() => {
		randomNumber(8, 4);
	}, 'The maximum value must be larger than the minimum value.');
});

test('randomInt throws an error if min or max is not an integer', () => {
	assert.throws(() => {
		randomInt(4.5, 8);
	}, 'The minimum and maximum values must be integers.');
});
