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

-	We also have a `multipleToArray<T>(..)` and `multipleToSet<T>(..)` utility which can be useful if you need to realize a `Multiple<T>` into a `T[]` or `Set<T>`. This might be needed if you need to loop more than once.

	```typescript
	declare const multiple: Multiple<string>;
	const arr: string[]    = multipleToArray(multiple);
	const set: Set<string> = multipleToSet(multiple);
	```

- Modification: For adding/removing one or more instances to a `target`.

	Both of these will mutate and return the `target`.
	```typescript
	declare const target: Set<string> | string[];
	declare const multiple1: Multiple<string>;
	declare const multiple2: Multiple<string>;
	addMultiple(target, multiple1, multiple2);
	removeMultiple(target, multiple1, multiple2);
	```

### Iteration: `Some<T>`

Since, according to some benchmarking, generators are adding some significant performance overhead, we provide a simplified variant of `Multiple<T>` which is an array, a set or a single item, but not an iterable.

Along with the type, we provide similar utilities:

-	Transforms:
	```typescript
	declare const some: Some<string>;
	someToIterable(some);
	someToArray(some);
	someToSet(some);
	```
-	Iterators: For iterating one or more instances:
	```typescript
	declare const some1: Some<string>;
	declare const some2: Some<string>;
	for (const s of iterateSome(some1, some2))
		console.log(s);
	```
-	Modification: For adding/removing one or more instances to a `target`.

	Both of these will mutate and return the `target`.
	```typescript
	declare const target: Set<string> | string[];
	declare const some1: Some<string>;
	declare const some2: Some<string>;
	addSome(target, some1, some2);
	removeSome(target, some1, some2);
	```

### Iteration: Side effects

There is an `iterateAll(iterator: IterableIterator<T>)` utility which allow you to iterate through an iterable without using its results. This is a quick way to ensure that any side effects you rely on from the iterator are triggered even when you don't need its output. You can achieve the same by spreading an iterator into an array, but that creates an unnecessary array.

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

The only exception is that `push()` and `enqueue()` takes `Some<T>` rather than a single item, which is quite convenient.

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


### Random

We have utilities for generating a random number, integer or from the gaussian normal distribution:

```typescript
// Random floating point number in the range [10, 99.2).
const num = randomNumber(10, 99.2);
// Random integer in the range [10, 42).
const int = randomNumber(10, 42);
// Sample the normal distribution which is the gaussian distribution with a mean of 0 and a standard deviation of 1.
const normal = randomGaussian();
// Sample the gaussian distribution with a mean of 42 and a standard deviation of 3.17.
const normal = randomGaussian(42, 3.17);
```


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


### The `Maybe` pattern

When the type of value and/or error can never be undefined, you can use `Maybe<Val, Error>` instead of the more complex `TryResult<Val, Reason>` since you can simply check if the value or error is undefined.

Since `Maybe` is simpler than `TryResult` there is no need for a result factory for this type.

Instead we provide some utilities for turning something that may or may not throw into a `Maybe`; `mayGet` for calling a function which may get or throw, and `mayResolve` for a promise. Like for `TryResult` the important part is that type of the value and error can be narrowed.

```typescript
const [num, error] = mayGet(getOrThrow);
if (typeof value === 'number')
	console.log(value);
else
	console.log(error);
```

```typescript
const [num, error] = mayResolve(numberPromise);
if (typeof value === 'number')
	console.log(value);
else
	console.log(error);
```


### The `ValueProvider` pattern

Sometimes you need to provide a value in some cases. Sometimes providing that value is computationally expensive. In those cases it's nice to lazily generate the value only when needed.

When authoring functions it's nice to have a common thing for this. That's what the `ValueProvider<T>` and associated utility function `resolveValueProvider(..)` is for.

You can use it like this:

```typescript
export const doIt = <T>(first: boolean, some: ValueProvider<T>, other: ValueProvider<T>) => {
	return resolveValueProvider(first ? some : other);
};
```


### The `MapArgs` pattern

Sometimes a function needs to transform one or more arguments into another type of value and return each of them, like `Array.prototype.map`. But that creates a need for one function which takes one input argument and returns one transformed item and another function which does this for an array of inputs.

With the `mapArgs` utility function and `MapArgs` utility type you can easily make one function for both of those needs. And to top it off you can make your function return a **tuple** with the same length as the input arguments for easily destructuring the outputs and avoiding the possibility of the destructured arguments being undefined, which would be the case if you return an `Array`.

In addition to the `args` and `transform` function, mapArgs takes two boolean arguments for deciding behavior:
- `asTuple`: Return a tuple (true), and otherwise an `Array` (default: false)
- `allowEmpty`: Throw when no items have been provided and return type `never` (default: false) or simply return `undefined` both as the value and as the type (true).

So, you could define a contrived function for prefixing numbers and returning and destructuring a tuple while disallowing no numbers like this:

```typescript
const mapPrefixTuple = <Args extends number[]>(prefix: string, ...args: Args) => {
	return mapArgs(args, arg => `${ prefix }-${ arg }`, true, false);
};

// a, b and c will be strings, rather than string | undefined because we passed true as the third argument 'asTuple' to mapArgs.
const [a, b, c] = mapPrefixTuple('pre', 1, 2, 3);
//    ^ [string, string, string]

// Retrieve a single item without array wrapping
const singleMapped = mapPrefixTuple('pre', 1);
//    ^ string

// Trying to retrieve no items will throw because we passed false as the fourth argument 'allowEmpty' to mapArgs.
const none = mapPrefixTuple('pre');
//           ^ throws
```
