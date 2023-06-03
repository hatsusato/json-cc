import assert from "assert";

export type FuncType<A extends unknown[], R> = (...args: A) => R;
export type PRecord<K extends PropertyKey, T> = Partial<Record<K, T>>;

export const isNull = (x: unknown): x is null => x === null;
export const isNonNull = <T>(x: T | null): x is T => x !== null;
export const isUndefined = (x: unknown): x is undefined => x === undefined;
export const isDefined = <T>(x: T | undefined): x is T => x !== undefined;
export const isNumber = (x: unknown): x is number => typeof x === "number";
export const isString = (x: unknown): x is string => typeof x === "string";
export const isArray = (x: unknown): x is unknown[] => Array.isArray(x);
export const isObject = (x: unknown): x is object =>
  !isNull(x) && !isArray(x) && typeof x === "object";
export const isNumberArray = (x: unknown): x is number[] =>
  isArray(x) && x.every(isNumber);

export const asDefined = <T>(x: T | undefined | null): T => {
  assert(isDefined(x) && isNonNull(x));
  return x;
};
export const asNumber = (x: unknown): number => {
  assert(isNumber(x));
  return x;
};
export const asArray = <T>(x: T | T[]): T[] => {
  assert(isArray(x));
  return x;
};

export const objMap = <T, U>(
  x: PRecord<string, T>,
  f: FuncType<[T], U>
): Record<string, U> => {
  return Object.entries(x)
    .map(([k, v]) => (isDefined(v) ? { [k]: f(v) } : {}))
    .reduce((prev, next) => ({ ...prev, ...next }), {});
};

export const hexlify = (str: string): string => {
  return str
    .split("")
    .map((ch) => "0x" + ch.charCodeAt(0).toString(16))
    .join(", ");
};
