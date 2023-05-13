export const isNull = (x: unknown): x is null => x === null;
export const isNotNull = <T>(x: T | null): x is T => x !== null;
export const isUndefined = (x: unknown): x is undefined => x === undefined;
export const isNotUndefined = <T>(x: T | undefined): x is T => x !== undefined;
export const isNumber = (x: unknown): x is number => typeof x === "number";
export const isString = (x: unknown): x is string => typeof x === "string";
export const isArray = (x: unknown): x is unknown[] => Array.isArray(x);
export const isObject = (x: unknown): x is object =>
  !isNull(x) && !isArray(x) && typeof x === "object";
export const hasKey = <K extends string>(
  x: object | null,
  key: K
): x is Record<K, unknown> => isObject(x) && key in x;
export const last = <T>(x: T[]): T => x[x.length - 1];
export const valueMap = <T, U>(
  value: Record<string, T>,
  f: (value: T) => U
): Record<string, U> =>
  Object.entries(value)
    .map(([key, value]) => ({ [key]: f(value) }))
    .reduce((prev, next) => ({ ...prev, ...next }), {});
export const hexlify = (str: string): string => {
  return str
    .split("")
    .map((ch) => "0x" + ch.charCodeAt(0).toString(16))
    .join(", ");
};
