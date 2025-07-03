import { describe, expect, it } from 'vitest';

import { splitBy, splitKvp } from '../../../src/primitives/string/splitting.js';


describe('splitBy', () => {
	it('SplitByDefault', () => {
		const parts = splitBy('A,B,C');

		expect(parts).toEqual([ 'A', 'B', 'C' ]);
	});

	it('SplitBy', () => {
		const parts = splitBy('A-B-C', { sep: '-' });

		expect(parts).toEqual([ 'A', 'B', 'C' ]);
	});

	it('SplitBy_WithMultipleSeparators', () => {
		const parts = splitBy('A-B&C', { sep: [ '-', '&' ] });

		expect(parts).toEqual([ 'A', 'B', 'C' ]);
	});

	it('SplitBy_WithStringSeparators', () => {
		const parts = splitBy('A::B<something>C', { sep: [ '::', '<something>' ] });

		expect(parts).toEqual([ 'A', 'B', 'C' ]);
	});

	it('SplitBy_RemovesEmptyEntriesByDefault', () => {
		const parts = splitBy('A,,B,C', { sep: ',' });

		expect(parts).toEqual([ 'A', 'B', 'C' ]);
	});

	it('SplitBy_HandlesRegexSpecialCharacters', () => {
		const parts = splitBy('A^B$C', { sep: [ '^', '$' ] });

		expect(parts).toEqual([ 'A', 'B', 'C' ]);
	});

	it('SplitByDefault_UsesDefaultSeparators', () => {
		const parts = splitBy('A:B;C,D');

		expect(parts).toEqual([ 'A', 'B', 'C', 'D' ]);
	});

	it('SplitByDefault_WithPipeCharacter', () => {
		const parts = splitBy('A|B|C');

		expect(parts).toEqual([ 'A', 'B', 'C' ]);
	});

	it('SplitBy_WorksWithAllDefaultSeparators', () => {
		const testCases = [
			{ input: 'A,B,C', separator: ',', expected: [ 'A', 'B', 'C' ] },
			{ input: 'A.B.C', separator: '.', expected: [ 'A', 'B', 'C' ] },
			{ input: 'A;B;C', separator: ';', expected: [ 'A', 'B', 'C' ] },
			{ input: 'A:B:C', separator: ':', expected: [ 'A', 'B', 'C' ] },
			{ input: 'A|B|C', separator: '|', expected: [ 'A', 'B', 'C' ] },
		];

		for (const testCase of testCases) {
			const result = splitBy(testCase.input, { sep: testCase.separator });
			expect(result).toEqual(testCase.expected);
		}
	});

	it('should be able to trim the results', () => {
		const source = ' A|B | C ';

		expect(splitBy(source, { sep: '|', trim: 'start' })).toEqual([ 'A', 'B ', 'C ' ]);
		expect(splitBy(source, { sep: '|', trim: 'end' })).toEqual([ ' A', 'B', ' C' ]);
		expect(splitBy(source, { sep: '|', trim: 'both' })).toEqual([ 'A', 'B', 'C' ]);
	});
});

describe('splitKvp', () => {
	it('SplitKvp_OfStrings', () => {
		const kvp = splitKvp('A:B');

		expect(kvp).toEqual([ 'A', 'B' ]);
	});

	it('SplitKvp_WithExtraSegments', () => {
		const kvp = splitKvp('A:B:Extra');

		// NB! Note that this behavior is different than in .NET,
		// which would have used "B:Extra" as the value.
		expect(kvp).toEqual([ 'A', 'B' ]);
	});

	it('SplitKvp_WithoutSeparator', () => {
		const kvp = splitKvp('Key');

		expect(kvp).toEqual([ 'Key', null ]);
	});

	it('SplitKvp_WithEmptyString', () => {
		const kvp = splitKvp('');

		expect(kvp).toEqual([ '', null ]);
	});

	it('SplitKvp_WithEmptyValuePart', () => {
		const kvp = splitKvp('Key:');

		expect(kvp).toEqual([ 'Key', null ]);
	});
});
