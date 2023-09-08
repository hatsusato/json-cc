import assert from "assert";

export const isDefined = <T>(x: T | null | undefined): x is T =>
  x !== undefined && x !== null;
export const isString = (x: unknown): x is string => typeof x === "string";
export const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === "object";
export const isArray = <T>(x: T[] | unknown): x is T[] => Array.isArray(x);
export const isEmpty = (x?: object): boolean =>
  Object.keys(x ?? {}).length === 0;

export const asString = (x: unknown): string => {
  assert(isString(x));
  return x;
};

export const objMap = <T, U>(
  x: Record<string, T>,
  f: (x: [string, T]) => U
): Record<string, U> =>
  Object.entries(x)
    .map(([k, v]) => ({ [k]: f([k, v]) }))
    .reduce((prev, next) => ({ ...prev, ...next }), {});

export class Option<T> {
  private readonly _value: T;
  readonly ok: boolean;
  constructor(value: unknown, ok: boolean) {
    this._value = value as T;
    this.ok = ok;
  }
  unwrap(): T {
    assert(this.ok);
    return this._value;
  }
  or(alt: T): T {
    return this.ok ? this.unwrap() : alt;
  }
  map<U>(f: (x: T) => U, pred?: (x: unknown) => boolean): Option<U> {
    return this.ok ? option(f(this.unwrap()), pred) : option();
  }
  as<U>(pred: (x: unknown) => boolean): Option<U> {
    return this.map((x) => x as unknown as U, pred);
  }
  asObject(): Option<Record<string, unknown>> {
    return this.as<Record<string, unknown>>(isObject);
  }
  toMember<K extends string>(key: K): Option<unknown> {
    return this.asObject().map((x) => x[key]);
  }
}
export const option = <T>(x?: T, pred?: (x: unknown) => boolean): Option<T> =>
  new Option(x, (pred ?? isDefined)(x));
