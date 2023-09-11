# @loken/utilities

[![Published on npm](https://img.shields.io/npm/v/@loken/utilities.svg?logo=npm)](https://www.npmjs.com/package/@loken/utilities)

Utility library for javascript with typescript support.

Many npm packages contain only a very small bit of code for a specific utility or feature. This package takes another approach. We add many utilities and features to a single package, expecting that the consumer will use tree shaking in order not to bloat their app.


## Features

A non-exhaustive list of features by theme.


### Iteration: `Multiple<T>`

JavaScript has a pretty cool memory-minimal feature for iteration called an `IterableIterator<T>`. The idea is that if something generates a million items, instead of taking up a million pieces of memory by placing this in an array, you rather generate and consume them one at a time. We feel like this is an underused feature.

Here is an example of a generator which creates an iterable iterator:

```typescript
const letterGenerator = function*() {
	yield 'a';
	yield 'b';
	yield 'c';
};
```

When you want a function to be able to take a single or multiple items, the three concepts are an item, an array of items or an iterable iterator of items. We call the union of these `Multiple<T>` and provide that as a type and some utilities to work with it:

-	If you define a function that takes a `Multiple<T>`, you can iterate it by using the `iterateMultiple<T>(..)` utility like this:

	```typescript
	const logger = (strings: Multiple<string>) => {
		for (const str of iterateMultiple(strings))
			console.log(s);
	}
	```

-	You can now call it in any of the three following ways:

	```typescript
	logger('Hello world!');
	logger(['Hello', 'Word']);
	logger(letterGenerator());
	```

-	We also have a `spreadMultiple<T>(..)` utility which can be useful if you need to realize a `Multiple<T>` into a `T[]`. This might be needed if you need to loop more than once.

	```typescript
	declare const multiple: Multiple<string>;
	const realized: string[] = spreadMultiple(multiple);
	```

-	Finally there is an `iterateAll(iterator: IterableIterator<T>)` utility which allow you to iterate through an iterable without using its results. This is a quick way to ensure that any side effects you rely on from the iterator are triggered even when you don't need its output.

	```typescript
	const letterGenerator = function*() {
		yield 'a';
		console.log('a');
		yield 'b';
		console.log('b');
		yield 'c';
		console.log('c');
	};

	// Performs the side effects of writing a b c to the console.
	iterateAll(letterGenerator());
	```


### Collections: `Stack<T>`, `Queue<T>` and `ILinear<T>`

In computer science the data structures for a stack and a queue where you can `push()` and `pop()` or `enqueue()` and `dequeue()`, respectively. We provide classes for these data structures. There's not much point in showing how they're used - it's idiomatic.

The only exception is that `push()` and `enqueue()` takes `Multiple<T>` rather than a single item, which is quite convenient.

Sometimes you have an algorithm which behaves well regardless of it using a stack or a queue, however. And in those cases it would be nice to not have to check everywhere if we're using a stack or a queue before we use it.

For this scenario we have an `ILinear<T>` interface and implementing classes `LinearStack<T>` and `LinearQueue<T>` which extends `Stack<T>` and `Queue<T>`, respectively. This means that you can implement a function as follows and have it return either 10 or 20 depending on whether you've passed a linear stack or a linear queue to it.

```typescript
const algorithm = (linear: ILinear<number>) => {
	linear.attach(10);
	linear.attach(20);
	linear.detach();
	return linear.peek();
}
```


### Strings

We have utilities for splitting and trimming strings using various separators and affixes.

-	Trimming

	`trimBy(str, direction)` is a simple wrapper for the native trim, trimStart and trimEnd functions which allows you to trim a string at either or both ends, but parameterize what it should do. Useful for when you have a setting being passed around for this.

-	Splitting

	-	`splitBy(str, options)` allow us to split a string according to the `SplitOptions` which dictates what separators to use, whether to keep empty entries, how to trim each entry and the maximum number of segments to keep.

	-	`splitByKvp(str, options)` is similar to `splitBy` but creates a tuple of a key and a value instead of an array.

	You can specify what separator(s) to use for both of the split* functions, but if you don't a set of default separators is used: `[':', ';', ',', '|']`.


### The `TryResult` pattern

Rather than throwing an exception when a function can't perform its task, it's useful to return a result which may contain the value when it's a success and somehow signal that the value can't be used, potentially with a reason, if it's not successful.

This is what our `TryResult<Val, Reason>` is for. It allows us to do things like this while having the types be appropriately constrained within the conditionals:

```typescript
/* Without reasons. */
declare const tryIt: () => TryResult<string>;
const [ value, success ] = tryIt();
if (success)
	console.log(value);
```

```typescript
/* With reasons. */
declare const tryIt: () => TryResult<string, string>;
const [ value, success, reason ] = tryIt();
if (success)
	console.log(value);
else
	console.log(reason);
```

This is equivalent to returning a boolean and an out parameter in languages like C#.


### The `ValueProvider` pattern

Sometimes you need to provide a value in some cases. Sometimes providing that value is computationally expensive. In those cases it's nice to lazily generate the value only when needed.

When authoring functions it's nice to have a common thing for this. That's what the `ValueProvider<T>` and associated utility function `resolveValueProvider(..)` is for.

You can use it like this:

```typescript
export const doIt = <T>(first: boolean, some: ValueProvider<T>, other: ValueProvider<T>) => {
	return resolveValueProvider(first ? some : other);
};
```
