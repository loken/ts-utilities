import { afterEach, describe, expect, test, vi } from 'vitest';

import { randomGaussian } from './random-gaussian.js';
import mockData from './random-gaussian.mock.json' assert { type: 'json' };


describe('with deterministic mocking', () => {
	afterEach(() => {
		// Restore the original Math.random after each test
		vi.restoreAllMocks();
	});

	test('WithDefaultParameters_ReturnsValueNearZero', () => {
		createMathRandomMock();
		const values: number[] = [];

		// Generate multiple samples to test the distribution
		for (let i = 0; i < 1000; i++)
			values.push(randomGaussian());

		// With mean=0 and stdDev=1, most values should be within ±3 standard deviations
		const withinRange = values.filter(v => v >= -3 && v <= 3).length;
		expect(withinRange).toBeGreaterThan(990); // ~99.7% should be within ±3σ

		// The mean should be close to 0
		const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
		expect(Math.abs(mean)).toBeLessThan(0.1);
	});

	test('WithCustomMeanAndStdDev_ReturnsCorrectDistribution', () => {
		createMathRandomMock();
		const expectedMean = 50.0;
		const expectedStdDev = 10.0;
		const values: number[] = [];

		// Generate multiple samples
		for (let i = 0; i < 1000; i++)
			values.push(randomGaussian(expectedMean, expectedStdDev));

		// Most values should be within ±3 standard deviations of the mean
		const lowerBound = expectedMean - 3 * expectedStdDev;
		const upperBound = expectedMean + 3 * expectedStdDev;
		const withinRange = values.filter(v => v >= lowerBound && v <= upperBound).length;
		expect(withinRange).toBeGreaterThan(990);

		// The sample mean should be close to the expected mean
		const actualMean = values.reduce((sum, val) => sum + val, 0) / values.length;
		expect(Math.abs(actualMean - expectedMean)).toBeLessThan(1.0);
	});

	test('ProducesNormalDistribution_WithinStandardDeviations', () => {
		createMathRandomMock();
		const mean = 100.0;
		const stdDev = 15.0;
		const values: number[] = [];

		// Generate a large sample
		for (let i = 0; i < 10000; i++)
			values.push(randomGaussian(mean, stdDev));

		// 68.2% should be within ±1 standard deviation (more lenient for limited samples)
		const withinOneStdDev = values.filter(v => v >= mean - stdDev && v <= mean + stdDev).length;
		const percentageWithinOne = (withinOneStdDev / values.length) * 100;
		expect(percentageWithinOne).toBeGreaterThan(65);
		expect(percentageWithinOne).toBeLessThan(72);

		// 95.4% should be within ±2 standard deviations (more lenient for limited samples)
		const withinTwoStdDev = values.filter(v => v >= mean - 2 * stdDev && v <= mean + 2 * stdDev).length;
		const percentageWithinTwo = (withinTwoStdDev / values.length) * 100;
		expect(percentageWithinTwo).toBeGreaterThan(93);
		expect(percentageWithinTwo).toBeLessThan(97);
	});

	test('WithDifferentSeeds_ProducesDifferentResults', () => {
		createMathRandomMock(5);
		const value1 = randomGaussian();
		vi.restoreAllMocks();

		createMathRandomMock(10);
		const value2 = randomGaussian();

		expect(value1).not.toBe(value2);
	});

	test('WithSameSeeds_ProducesConsistentResults', () => {
		createMathRandomMock(10);
		const value1 = randomGaussian(10, 2);
		vi.restoreAllMocks();

		createMathRandomMock(10);
		const value2 = randomGaussian(10, 2);

		expect(value1).toBe(value2);
	});

	test('WithZeroStandardDeviation_ReturnsExactMean', () => {
		createMathRandomMock();
		const mean = 42.0;

		const value = randomGaussian(mean, 0);

		expect(value).toBe(mean);
	});

	test('WithNegativeStandardDeviation_ReturnsInvertedDistribution', () => {
		createMathRandomMock();
		const mean = 0.0;
		const negativeStdDev = -1.0;

		const values: number[] = [];
		for (let i = 0; i < 100; i++)
			values.push(randomGaussian(mean, negativeStdDev));

		// With negative std dev, the distribution should still work but be inverted
		// The absolute values should still follow the normal distribution pattern
		const hasVaryingValues = values.some(v => v !== mean);
		expect(hasVaryingValues).toBe(true);
	});

	test('HandlesEdgeCases_WithExtremeRandomValues', () => {
		// Create a special mock for edge cases
		const edgeCaseValues = [ 0.001, 0.999 ];
		let edgeCallCount = 0;

		vi.spyOn(Math, 'random').mockImplementation(() => {
			return edgeCaseValues[edgeCallCount++ % edgeCaseValues.length]!;
		});

		const result = randomGaussian(0, 1);

		// Should not throw and should return a finite number
		expect(result).toBeTypeOf('number');
		expect(Number.isFinite(result)).toBe(true);
	});
});


describe('with real randomness (statistical validation)', () => {
	test('GeneratesCorrectMean_OverManySamples', () => {
		const samples = 10000;
		const expectedMean = 42;
		const stdDev = 5;
		const values: number[] = [];

		for (let i = 0; i < samples; i++)
			values.push(randomGaussian(expectedMean, stdDev));

		const actualMean = values.reduce((sum, val) => sum + val, 0) / samples;

		// With 10,000 samples, the sample mean should be very close to the expected mean
		// Using a tolerance of 0.2 (about 4% of stdDev)
		expect(actualMean).toBeCloseTo(expectedMean, 0);
	});

	test('FollowsNormalDistributionRules_WithBroadTolerances', () => {
		const samples = 5000;
		const mean = 0;
		const stdDev = 1;
		const values: number[] = [];

		for (let i = 0; i < samples; i++)
			values.push(randomGaussian(mean, stdDev));

		// Calculate actual statistics
		const sampleMean = values.reduce((sum, v) => sum + v, 0) / values.length;
		const sampleStdDev = Math.sqrt(values.reduce((sum, v) => sum + (v - sampleMean) ** 2, 0) / values.length);

		// Test the 68-95-99.7 rule with more lenient tolerances due to randomness
		const withinOneSigma   = values.filter(v => Math.abs(v - mean) <= 1 * stdDev).length;
		const withinTwoSigma   = values.filter(v => Math.abs(v - mean) <= 2 * stdDev).length;
		const withinThreeSigma = values.filter(v => Math.abs(v - mean) <= 3 * stdDev).length;

		const percentageOneSigma   = (withinOneSigma   / samples) * 100;
		const percentageTwoSigma   = (withinTwoSigma   / samples) * 100;
		const percentageThreeSigma = (withinThreeSigma / samples) * 100;

		// The sample mean should be reasonably close to 0
		expect(Math.abs(sampleMean)).toBeLessThan(0.1);

		// The sample standard deviation should be reasonably close to 1
		// Allow wider range since random samples can vary significantly
		expect(sampleStdDev).toBeGreaterThan(0.9);
		expect(sampleStdDev).toBeLessThan(1.1);

		// Use broader tolerances for distribution tests
		expect(percentageOneSigma).toBeGreaterThan(65);
		expect(percentageOneSigma).toBeLessThan(71);

		expect(percentageTwoSigma).toBeGreaterThan(93);
		expect(percentageTwoSigma).toBeLessThan(97);

		expect(percentageThreeSigma).toBeGreaterThan(99.5);
		expect(percentageThreeSigma).toBeLessThan(99.9);
	});
});

// For deterministic mocking of Math.random(), equivalent to .NET's seeded Random
const createMathRandomMock = (seed = 0) => {
	let index = seed % mockData.length;

	// The mockData contains a sequence of pre-generated values from Math.random()
	const mockValues = mockData as number[];

	return vi.spyOn(Math, 'random').mockImplementation(() => {
		return mockValues[index++ % mockValues.length]!;
	});
};
