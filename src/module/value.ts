import type { Id, Module } from "./types";
import { ExpandVisitor } from "./visit";

export class ValueRef {
  readonly id: Id;
  private module: Module;
  constructor(id: Id, module: Module) {
    this.id = id;
    this.module = module;
  }
  get value(): Value {
    return this.module.at(this.id);
  }
}

export class Value {
  private ref: ValueRef;
  type: string;
  symbol?: string;
  list?: Value[];
  children: Record<string, Value> = {};
  constructor(module: Module, id: Id, type: string) {
    this.ref = new ValueRef(id, module);
    this.type = type;
  }
  show(stringify: boolean = true): string | object {
    const value = new ExpandVisitor().visit(this);
    return stringify ? JSON.stringify(value, undefined, 2) : value;
  }
  get id(): Id {
    return this.ref.id;
  }
}
