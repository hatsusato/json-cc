import assert from "assert";

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

export const unwrap = <T>(x: T | undefined | null): T => {
  assert(isDefined(x) && isNonNull(x));
  return x;
};

type PRecord<K extends PropertyKey, T> = Partial<Record<K, T>>;
type MapType<T, U> = (x: T) => U | undefined;
export function smartMap<T, U>(x: T, f: MapType<T, U>): U;
export function smartMap<T, U>(x: T[], f: MapType<T, U>): U[];
export function smartMap<K extends string, T, U>(
  x: PRecord<K, T>,
  f: MapType<T, U>
): Record<K, U>;
export function smartMap<T, U>(x: null, f: MapType<T, U>): null;
export function smartMap<T, U>(x: undefined, f: MapType<T, U>): undefined;
export function smartMap<T, U>(
  x: T | undefined,
  f: MapType<T, U>
): U | undefined;
export function smartMap<T, U>(
  x: T | T[] | null,
  f: MapType<T, U>
): U | U[] | null;
export function smartMap<K extends string, T, U>(
  x: T | T[] | PRecord<K, T> | null | undefined,
  f: MapType<T, U>
): U | U[] | Record<K, U> | null | undefined {
  if (isArray(x)) {
    return x.map(f).filter(isDefined);
  } else if (isObject(x)) {
    const g = (k: string, v?: U): Record<string, U> =>
      isDefined(v) ? { [k]: v } : {};
    return Object.entries<T | undefined>(x)
      .map(([k, v]) => g(k, smartMap(v, f)))
      .reduce((prev, next) => ({ ...prev, ...next }), {}) as Record<K, U>;
  } else {
    return isNull(x) || isUndefined(x) ? x : f(x);
  }
}

export const hexlify = (str: string): string => {
  return str
    .split("")
    .map((ch) => "0x" + ch.charCodeAt(0).toString(16))
    .join(", ");
};
