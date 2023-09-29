/**
 * Get a random number from the gaussian (or normal) distribution using the Box-Muller transform.
 *
 * The result is 68.2% likely to be within ±1 `stdDev` of the `mean`
 * and 95.4% likely to be within ±2 `stdDev` of the `mean`.
 *
 * @param mean The mean.
 * @param stdDev The standard deviation.
 * @returns A random floating-point number.
 */
export const randomGaussian = (mean = 0, stdDev = 1) => {
	// Random numbers in the interval: (0,1]
	const u1 = 1 - Math.random();
	const u2 = 1 - Math.random();

	// Generate a normal sample with a mean of 0 and standard deviation of 1.
	const sample = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);

	// Translate and scale the sample to the wanted mean and standard deviation.
	const scaled = mean + stdDev * sample;

	return scaled;
};
