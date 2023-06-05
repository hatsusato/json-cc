import assert from "assert";

export type FuncType<A extends unknown[], R> = (...args: A) => R;
export type PRecord<K extends PropertyKey, T> = Partial<Record<K, T>>;

const isDefined = <T>(x: T | undefined): x is T => x !== undefined;
const isNonNull = <T>(x: T | null): x is T => x !== null;
const isObject = (x: unknown): x is object =>
  typeof x === "object" && isNonNull(x) && !isArray(x);
export const isNumber = (x: unknown): x is number => typeof x === "number";
export const isArray = (x: unknown): x is unknown[] => Array.isArray(x);

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
  get ok(): boolean {
    return isDefined(this.value);
  }
  get unwrap(): T {
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
