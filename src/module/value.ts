import type { Id, Module } from "./types";
import { expandValue } from "./visit";

export class ValueRef {
  readonly id: Id;
  private readonly module: Module;
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
  private module: Module;
  type: string;
  symbol?: string;
  list?: Value[];
  children: Record<string, Value> = {};
  constructor(module: Module, id: Id, type: string) {
    this.ref = new ValueRef(id, module);
    this.module = module;
    this.type = type;
  }
  show(stringify: boolean = true): string | object {
    const value = expandValue(this);
    return stringify ? JSON.stringify(value, undefined, 2) : value;
  }
  clone(): Value {
    return this.module.cloneValue(this);
  }
  newValue(type: string): Value {
    return this.module.createValue(type);
  }
  get id(): Id {
    return this.ref.id;
  }
}
