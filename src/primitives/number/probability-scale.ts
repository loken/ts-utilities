import { Stack } from '../../collections/stack.js';


/**
 * The initial `probability` and the `mode` of change each time we `scale`.
 */
export interface ProbabilityScaleOptions {
	/**
	 * Determines whether the probability scales down (decays) or scales up (grows) with each layer.
	 * - `'decay'` (default): The probability decreases with each layer by multiplying it with the scaling factor.
	 * - `'grow'`: The probability increases with each layer by adding the difference between 1 and the current probability multiplied by the scaling factor.
	 */
	mode: 'decay' | 'grow';

	/** The initial probability value. A number between 0 and 1. (default: 0.5). */
	probability: number;

	/** The scaling factor. A number between 0 and 1. (default: 0.5). */
	scale: number;
}


/**
 * Represents a probability which scales by decaying or growing according to a scale with diminishing returns.
 */
export class ProbabilityScale implements ProbabilityScaleOptions {

	/**
	 * Stores the probability values for every layer we've gone down.
	 */
	#stack = new Stack<number>();

	public readonly mode;
	public readonly probability;
	public readonly scale;

	/**
	 * Initializes a new instance of the `ProbabilityScale` class.
	 * @param options - The options decides what the initial probability is and how it changes when we scale up.
	 */
	constructor(options: Partial<ProbabilityScaleOptions>) {
		if (options.probability && (options.probability < 0 || options.probability > 1))
			throw new Error(`The 'probability' option was '${ options.probability }' but must be between 0 and 1.`);
		if (options.scale && (options.scale < 0 || options.scale > 1))
			throw new Error(`The 'scale' option was '${ options.scale }' but must be between 0 and 1.`);
		if (options.mode && options.mode !== 'decay' && options.mode !== 'grow')
			throw new Error(`The 'mode' option was '${ options.mode }' but must be either 'decay' or 'growth'.`);

		this.mode        = options.mode        ?? 'decay';
		this.probability = options.probability ?? 0.5;
		this.scale       = options.scale       ?? 0.5;
	}

	/**
	 * The number of layers tells us how many times we've applied the scale to the probability.
	 */
	public get layer() {
		return this.#stack.count;
	}

	/** The probability at the current `layer`. */
	public get current() {
		const [ current, success ] = this.#stack.tryPeek();

		return success ? current : this.probability;
	}

	/**
	 * Collect a pseudorandom sample of beating the current probability.
	 */
	public sample() {
		return Math.random() <= this.current;
	}

	/**
	 * Increments the current the probability by applying the scale a number of times equal to the `count`.
	 * @param count- The number of times to scale. (Default: 1)
	 * @returns The current probability after incrementing the layer.
	 */
	public increment(count = 1) {
		let current = this.current;

		while (count-- > 0) {
			const next = this.mode === 'decay'
				? current * this.scale
				: current + (1 - current) * this.scale;

			this.#stack.push(next);

			current = next;
		}

		return current;
	}

	/**
	 * Decrements the current probability by removing applications of the scale a number of times equal to the `count`.
	 * @param count - The number of scale applications to undo. (Default: 1)
	 * @throws {Error} If the specified number of layers is greater than or equal to the total number of layers in the stack.
	 * @returns The current value after decrementing.
	 */
	public decrement(count = 1) {
		if (count > this.layer)
			throw new Error(`Cannot decrement '${ count }' layers since that would require more layers than the '${ this.layer }' current layers.`);

		while (count-- > 0)
			this.#stack.pop();

		return this.current;
	}

}
