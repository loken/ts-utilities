import { assert, test } from 'vitest';

import { ProbabilityScale } from './probability-scale.js';


test('A decaying ProbabilityScale has the correct probability at various layers.', () => {
	const ps = new ProbabilityScale({ mode: 'decay', probability: 0.90, scale: 0.50 });

	assert.equal(ps.current, 0.90,           'initial');

	assert.equal(ps.increment(), 0.45,       'up to layer 1: 0.9 * 0.5^1');
	assert.equal(ps.increment(5), 0.0140625, 'up to layer 6: 0.9 * 0.5^6');

	assert.equal(ps.decrement(4), 0.225,     'down to layer 2: 0.9 * 0.5^2');
	assert.equal(ps.decrement(2), 0.90,      'down to layer 0');
});


test('A growing ProbabilityScale has the correct probability at various layers.', () => {
	const ps = new ProbabilityScale({ mode: 'grow', probability: 0.30, scale: 0.50 });

	assert.equal(ps.current, 0.30, 'initial');

	assert.equal(ps.increment(2), 0.825,  'up to layer 2');
	assert.equal(ps.increment(1), 0.9125, 'up to layer 3');
});
