import { isEmpty, objMap } from "../util";
import type { Done, Id, Module } from "./types";

export interface IdRef {
  id: Id;
  module: Module;
}
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
    const expand = new ExpandVisitor(this.idref.module);
    const value = expand.visit(this);
    return stringify ? JSON.stringify(value, undefined, 2) : value;
  }
}

class ExpandVisitor {
  module: Module;
  done: Done = {};
  constructor(module: Module) {
    this.module = module;
  }
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
