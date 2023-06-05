import { PRecord } from "../util";
import { type ElemAccessor, type Module } from "./module";
import { type ModuleElem } from "./node";
export { type ModuleElem };

export type Id = number;
export type IdValue = Id | Id[];
export type NodeValue = PRecord<string, IdValue>;
export type NodeParams = {
  type: string;
  token?: string;
  value?: NodeValue;
};
export interface Transformer {
  tag: string;
  apply(accessor: ElemAccessor): void;
}
export interface Visitor {
  apply: (node: ModuleElem, module: Module) => string[] | undefined;
}
