import { type Value } from "./value";

export { type Module } from "./module";
export { type Option } from "./util";
export { type Value } from "./value";

export type Id = number;
export interface Transform {
  readonly tag: string;
  apply(value: Value): Id | void;
}
