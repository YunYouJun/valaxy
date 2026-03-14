/**
 * Check if a value is a Promise-like object.
 *
 * Used by fence wrapper plugins (preWrapper, lineNumbers, etc.) to handle
 * async highlight results from markdown-exit. When the highlight function
 * returns a Promise, markdown-exit's built-in fence rule propagates it.
 * Wrapper plugins must detect this and chain via .then() instead of
 * using the result as a string (which would produce "[object Promise]").
 */
export function isPromiseLike(v: unknown): v is PromiseLike<unknown> {
  return typeof v === 'object' && v !== null && typeof (v as any).then === 'function'
}
