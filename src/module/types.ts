import type { Value } from "./value";

export type { Module } from "./module";
export type { Option } from "./util";
export type { Value } from "./value";

export type Id = number;
export type Done = Record<Id, Id>;
export interface Transform {
  readonly tag: string;
  apply(value: Value, visit: () => void): Value | void;
}
