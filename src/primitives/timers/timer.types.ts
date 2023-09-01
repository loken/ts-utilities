/** Utility type for `setTimeout` which is compatible with both DOM and nodejs libs. */
export type TimeoutHandle = ReturnType<typeof setTimeout>;
