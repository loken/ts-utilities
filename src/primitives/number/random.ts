/**
 * Generates a random number within a specified range.
 * @param min - The minimum value (inclusive). (Default: 0)
 * @param max - The maximum value (exclusive). (Default: 1)
 * @returns A random number within the specified range.
 * @throws {Error} If the maximum value is not larger than the minimum value.
 */
export const randomNumber = (min = 0, max = 1): number => {
	if (max <= min)
		throw new Error('The maximum value must be larger than the minimum value.');

	return Math.random() * (max - min) + min;
};

/**
  * Generates a random integer within a specified range.
  * @param min - The minimum value (inclusive).
  * @param max - The maximum value (exclusive).
  * @returns A random integer within the specified range.
  * @throws {Error} If the minimum or maximum values are not integers.
  * @throws {Error} If the maximum value is not larger than the minimum value.
  */
export const randomInt = (min: number, max: number): number => {
	if (!Number.isInteger(min) || !Number.isInteger(max))
		throw new Error('The minimum and maximum values must be integers.');

	return Math.floor(randomNumber(min, max));
};
