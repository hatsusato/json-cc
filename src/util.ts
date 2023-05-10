export type Other = Record<string, unknown>;
export type PartialPick<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export const isNull = (x: unknown): x is null => x === null;
export const isNumber = (x: unknown): x is number => typeof x === "number";
export const isArray = (x: unknown): x is unknown[] => Array.isArray(x);
export const isObject = (x: unknown): x is object =>
  !isNull(x) && !isArray(x) && typeof x === "object";
export const hasKey = <K extends string>(
  x: object | null,
  key: K
): x is Record<K, unknown> => isObject(x) && key in x;
export const last = (x: unknown[]): unknown => x[x.length - 1];
export const valueMap = (
  value: object,
  f: (value: unknown) => unknown
): object =>
  Object.entries(value)
    .map(([key, value]) => ({ [key]: f(value) }))
    .reduce((prev, next) => ({ ...prev, ...next }), {});
export const hexlify = (str: string): string => {
  return str
    .split("")
    .map((ch) => "0x" + ch.charCodeAt(0).toString(16))
    .join(", ");
};
