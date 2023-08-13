import { isEmpty, objMap } from "../util";
import type { Done, Id, Module } from "./types";

export class Value {
  module: Module;
  id: Id;
  type: string;
  symbol?: string;
  list?: Value[];
  children: Record<string, Value>;
  constructor(module: Module, id: Id, type: string) {
    this.module = module;
    this.id = id;
    this.type = type;
    this.children = {};
  }
  show(stringify: boolean = true): string | object {
    const expand = new ExpandVisitor(this.module);
    const value = expand.visit(this.id);
    return stringify ? JSON.stringify(value, undefined, 2) : value;
  }
}

class ExpandVisitor {
  module: Module;
  done: Done = {};
  constructor(module: Module) {
    this.module = module;
  }
  visit(id: Id): object {
    if (id in this.done) return { ref: id };
    this.done[id] = id;
    const { module: _, children, list, ...value } = this.module.at(id);
    return {
      ...value,
      ...(isEmpty(list) ? {} : { list: list?.map((x) => this.visit(x.id)) }),
      children: objMap(children, ([, v]) => this.visit(v.id)),
    };
  }
}
