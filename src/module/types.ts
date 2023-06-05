import { PRecord } from "../util";
import { type ElemAccessor, type Module } from "./module";
import { type NodeElem } from "./node";
export { type NodeElem };

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
  apply: (node: NodeElem, module: Module) => string[] | undefined;
}
