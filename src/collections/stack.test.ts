import { describe, expect, it } from 'vitest';

import { Stack } from './stack.js';

describe('stack', () => {
	it('should be last-in-first-out (LIFO)', () => {
		const stack = new Stack<string>();

		stack.push([ 'one', 'two' ]);

		expect(stack.count).toBe(2);

		const a = stack.pop();
		const b = stack.pop();

		expect(a).toBe('two');
		expect(b).toBe('one');
	});

	it('should handle empty state correctly', () => {
		const stack = new Stack<number>();

		expect(stack.count).toBe(0);
		expect(() => stack.pop()).toThrow('No more items in stack!');
		expect(() => stack.peek()).toThrow('No more items in stack!');

		stack.push(42);

		expect(stack.count).toBe(1);
		expect(stack.peek()).toBe(42);
		expect(stack.pop()).toBe(42);

		expect(stack.count).toBe(0);
		expect(() => stack.pop()).toThrow('No more items in stack!');
	});

	it('should resize correctly when capacity is exceeded', () => {
		const stack = new Stack<number>(2);

		stack.push([ 1, 2 ]);

		expect(stack.count).toBe(2);

		stack.push(3); // Trigger resize

		expect(stack.count).toBe(3);
		expect(stack.pop()).toBe(3);
		expect(stack.pop()).toBe(2);
		expect(stack.pop()).toBe(1);

		expect(stack.count).toBe(0);
	});

	it('should handle pushing and popping large numbers of items', () => {
		const stack = new Stack<number>(8);

		for (let i = 1; i <= 1000; i++)
			stack.push(i);

		expect(stack.count).toBe(1000);

		for (let i = 1000; i >= 1; i--)
			expect(stack.pop()).toBe(i);

		expect(stack.count).toBe(0);
	});

	it('should handle interleaved push and pop operations', () => {
		const stack = new Stack<number>();

		stack.push([ 1, 2 ]);

		expect(stack.pop()).toBe(2);

		stack.push([ 3, 4 ]);

		expect(stack.pop()).toBe(4);
		expect(stack.pop()).toBe(3);

		stack.push(5);

		expect(stack.pop()).toBe(5);
		expect(stack.pop()).toBe(1);

		expect(stack.count).toBe(0);
	});

	it('should handle mixed data types', () => {
		const stack = new Stack<any>();

		stack.push([ 1, 'two', { three: 3 }, [ 4 ] ]);

		expect(stack.count).toBe(4);

		expect(stack.pop()).toEqual([ 4 ]);
		expect(stack.pop()).toEqual({ three: 3 });
		expect(stack.pop()).toBe('two');
		expect(stack.pop()).toBe(1);

		expect(stack.count).toBe(0);
	});

	it('should handle clearing the stack', () => {
		const stack = new Stack<number>();

		stack.push([ 1, 2, 3 ]);

		expect(stack.count).toBe(3);

		stack.clear();

		expect(stack.count).toBe(0);
		expect(() => stack.pop()).toThrow('No more items in stack!');
	});

	it('should handle peeking at an empty stack without modifying state', () => {
		const stack = new Stack<number>();

		expect(() => stack.peek()).toThrow('No more items in stack!');
		expect(stack.count).toBe(0);
	});

	it('should handle pushing null or undefined values', () => {
		const stack = new Stack<any>();

		stack.push([ null, undefined ]);

		expect(stack.count).toBe(2);

		expect(stack.pop()).toBe(undefined);
		expect(stack.pop()).toBe(null);

		expect(stack.count).toBe(0);
	});
});
