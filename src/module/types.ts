import { PRecord } from "../util";
import { type Module } from "./module";
import { type ElemAccessor } from "./traverse";

export type Id = number;
export type IdValue = Id | Id[];
export type NodeValue = PRecord<string, IdValue>;
export type NodeParams = {
  type: string;
  token?: string;
  value?: NodeValue;
};
export type Node = Required<NodeParams>;
export type NodeElem = Node & {
  readonly id: Id;
};
export interface Transformer {
  tag: string;
  apply(accessor: ElemAccessor): void;
}
export interface Visitor {
  apply: (node: NodeElem, module: Module) => string[] | undefined;
}
