import { isEmpty, objMap } from "../util";
import type { Module } from "./types";

export type Id = number;
export interface IdRef {
  id: Id;
  module: Module;
}
export type Done = Record<Id, Id>;

export class Value {
  idref: IdRef;
  type: string;
  symbol?: string;
  list?: Value[];
  children: Record<string, Value>;
  constructor(module: Module, id: Id, type: string) {
    this.idref = { id, module };
    this.type = type;
    this.children = {};
  }
  show(stringify: boolean = true): string | object {
    const value = new ExpandVisitor().visit(this);
    return stringify ? JSON.stringify(value, undefined, 2) : value;
  }
}

class ExpandVisitor {
  done: Done = {};
  visit(value: Value): object {
    const { id } = value.idref;
    if (id in this.done) return { ref: id };
    this.done[id] = id;
    const { idref, children, list, ...rest } = value;
    return {
      id,
      ...rest,
      ...(isEmpty(list) ? {} : { list: list?.map((v) => this.visit(v)) }),
      children: objMap(children, ([, v]) => this.visit(v)),
    };
  }
}
