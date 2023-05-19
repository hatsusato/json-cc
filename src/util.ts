export const isNull = (x: unknown): x is null => x === null;
export const isNotNull = <T>(x: T | null): x is T => x !== null;
export const isUndefined = (x: unknown): x is undefined => x === undefined;
export const isNotUndefined = <T>(x: T | undefined): x is T => x !== undefined;
export const isNumber = (x: unknown): x is number => typeof x === "number";
export const isString = (x: unknown): x is string => typeof x === "string";
export const isArray = (x: unknown): x is unknown[] => Array.isArray(x);
export const isObject = (x: unknown): x is object =>
  !isNull(x) && !isArray(x) && typeof x === "object";
export const isNumberArray = (x: unknown): x is number[] =>
  isArray(x) && x.every(isNumber);
export const last = <T>(x: T[]): T => x[x.length - 1];
export const applyOrUndef = <T, U>(
  x: T | undefined,
  f: (x: T) => U
): U | undefined => (isUndefined(x) ? undefined : f(x));
export const valueMap = <T, U>(
  value: Partial<Record<string, T>>,
  f: (value: T) => U | undefined
): Record<string, U> =>
  Object.entries(value)
    .map(
      ([key, value]) =>
        applyOrUndef(applyOrUndef(value, f), (val) => ({ [key]: val })) ?? {}
    )
    .reduce((prev, next) => ({ ...prev, ...next }), {});
export const hexlify = (str: string): string => {
  return str
    .split("")
    .map((ch) => "0x" + ch.charCodeAt(0).toString(16))
    .join(", ");
};
