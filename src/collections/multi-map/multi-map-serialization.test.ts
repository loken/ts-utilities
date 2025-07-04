import { describe, expect, it } from 'vitest';

import { MultiMap } from '../../../src/collections/multi-map/multi-map.js';
import { trimLines } from '../../../src/primitives/string/lines.js';
import type { MultiMapSeparators } from './multi-map-types.js';


describe('MultiMap<string> serialization', () => {
	const source = trimLines(`
	A:A1,A2
	A1:A11,A12
	B:B1,B2
	`);

	const map = new MultiMap<string>();
	map.add('A', [ 'A1', 'A2' ]);
	map.add('A1', [ 'A11', 'A12' ]);
	map.add('B', [ 'B1', 'B2' ]);

	it('should render a `MultiMap<string>` to a string', () => {
		const rendered = MultiMap.render(map);

		expect(rendered).toEqual(source);
	});

	it('should parse a string into a `MultiMap<string>`', () => {
		const parsed = MultiMap.parse(source);

		expect(parsed).toEqual(map);
	});

	it('should parse and render a `MultiMap<string>` using custom separators', () => {
		const input = 'A>A1+A2#A1>A11+A12#B>B1+B2';

		const sep = MultiMap.getSeparators({
			entry:    '#',
			keyValue: '>',
			value:    '+',
		});

		const parsed = MultiMap.parse(input, sep);
		const rendered = MultiMap.render(parsed, sep);

		expect(rendered).toEqual(input);
	});

	it('should preserve keys without values during serialization', () => {
		const input = trimLines(`
		KeyWithValues:A,B
		KeyWithoutValues
		`);

		const parsed = MultiMap.parse(input);
		expect(parsed.get('KeyWithValues')).has.keys([ 'A', 'B' ]);
		expect(parsed.get('KeyWithoutValues')).is.empty;

		const output = parsed.render();
		expect(output).toEqual(input);
	});

	it('should handle empty input', () => {
		const parsed = MultiMap.parse('');
		expect(parsed.size).to.equal(0);

		const rendered = MultiMap.render(parsed);
		expect(rendered).toEqual('');
	});

	it('should handle whitespace and trimming', () => {
		const input = trimLines(`
		A:A1,A2
		B:B1
		`);

		const parsed = MultiMap.parse(input);
		expect(parsed.get('A')).has.keys([ 'A1', 'A2' ]);
		expect(parsed.get('B')).has.keys([ 'B1' ]);
	});
});

describe('MultiMap<number> serialization', () => {
	const source = trimLines(`
	1:11,12
	11:111,112
	2:21,22
	`);

	const map = new MultiMap<number>();
	map.add(1, [ 11, 12 ]);
	map.add(11, [ 111, 112 ]);
	map.add(2, [ 21, 22 ]);

	it('should render a `MultiMap<number>` to a string', () => {
		const rendered = MultiMap.render(map);

		expect(rendered).toEqual(source);
	});

	it('should parse a string into a `MultiMap<number>`', () => {
		const parsed = MultiMap.parse(source, { transform: parseInt });

		expect(parsed).toEqual(map);
	});

	it('should handle number serialization with custom separators', () => {
		const input = '1>11+12#11>111+112#2>21+22';

		const sep = MultiMap.getSeparators({
			entry:    '#',
			keyValue: '>',
			value:    '+',
		});

		const parsed = MultiMap.parse(input, { transform: parseInt, ...sep });
		const rendered = MultiMap.render(parsed, sep);

		expect(rendered).toEqual(input);
	});

	it('should handle keys without values for numbers', () => {
		const input = trimLines(`
		1:11,12
		2
		3:31
		`);

		const parsed = MultiMap.parse(input, { transform: parseInt });
		expect(parsed.get(1)).has.keys([ 11, 12 ]);
		expect(parsed.get(2)).is.empty;
		expect(parsed.get(3)).has.keys([ 31 ]);

		const output = parsed.render();
		expect(output).toEqual(input);
	});
});

describe('MultiMap serialization with custom separators', () => {
	const sep: MultiMapSeparators = {
		entry:  '\n\t\t',
		prefix: '\n\t\t',
	};

	it('should serialize strings with custom formatting', () => {
		const input = `
		A:A1,A2
		A1:A11,A12
		B:B1,B12`;

		const map = MultiMap.parse(input);
		expect(map.get('A')!).has.keys([ 'A1', 'A2' ]);

		const output = map.render(sep);
		expect(output).to.equal(input);
	});

	it('should serialize integers with custom formatting', () => {
		const input = `
		1:11,12
		11:111,112
		2:21,212`;

		const map = MultiMap.parse(input, { transform: parseInt });
		expect(map.get(1)!).has.keys([ 11, 12 ]);

		const output = map.render(sep);
		expect(output).to.equal(input);
	});

	it('should handle complex custom separators', () => {
		const input = 'START||A>>A1&&A2||A1>>A11&&A12||B>>B1&&B2||END';
		const customSep = MultiMap.getSeparators({
			entry:    '||',
			keyValue: '>>',
			value:    '&&',
			prefix:   'START||',
			suffix:   '||END',
		});

		const parsed = MultiMap.parse(input, customSep);
		expect(parsed.get('A')).has.keys([ 'A1', 'A2' ]);
		expect(parsed.get('B')).has.keys([ 'B1', 'B2' ]);

		const rendered = MultiMap.render(parsed, customSep);
		expect(rendered).toEqual(input);
	});
});
