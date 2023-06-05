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

export const toNumber = (x: unknown): number | undefined => {
  return isNumber(x) ? x : undefined;
};
export const toArray = <T, U>(x: T[] | U): T[] | undefined => {
  return isArray(x) ? x : undefined;
};

export class Option<T> {
  readonly value: T | undefined;
  constructor(value: T | undefined | null) {
    this.value = value ?? undefined;
  }
  map<U>(f: FuncType<[T], U | undefined>): Option<U> {
    return new Option(isDefined(this.value) ? f(this.value) : undefined);
  }
  or(value: T): T {
    return isDefined(this.value) ? this.value : value;
  }
  get get(): T {
    assert(isDefined(this.value));
    return this.value;
  }
}
export const option = <T>(x?: T): Option<T> => new Option(x);

export const objMap = <T, U>(
  x: PRecord<string, T>,
  f: FuncType<[T], U>
): Record<string, U> => {
  return Object.entries(x)
    .map(([k, v]) =>
      option(v)
        .map((v) => ({ [k]: f(v) }))
        .or({})
    )
    .reduce((prev, next) => ({ ...prev, ...next }), {});
};

export const replaceKey = (
  x: Record<string, unknown>,
  from: string,
  to: string
): void => {
  [x[to], x[from]] = [x[from], undefined];
};

export const hexlify = (str: string): string => {
  return str
    .split("")
    .map((ch) => "0x" + ch.charCodeAt(0).toString(16))
    .join(", ");
};
