import { assert } from "console";
import { Option, option } from "../util";
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
  symbol: Option<string> = option();
  list: Option<Value[]> = option();
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
  newSymbol(symbol: string): Value {
    const value = this.newValue("symbol");
    value.symbol = option(symbol);
    return value;
  }
  newList(): Value {
    const value = this.newValue("list");
    value.list = option([]);
    return value;
  }
  pushList(elem: Value): void {
    assert(this.type === "list" && this.list.ok);
    this.list.unwrap().push(elem);
  }
  get id(): Id {
    return this.ref.id;
  }
}
