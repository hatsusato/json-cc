import assert from "assert";

export const asString = (x: unknown): string => {
  assert(typeof x === "string");
  return x;
};
export const isNonNull = <T>(x: T | null): x is T => x !== null;
export const isObject = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null;
