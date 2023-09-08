import { assert } from "console";
import { Option, option } from "../util";
import { getPool } from "./pool";
import type { Id } from "./types";
import { expandValue } from "./visit";

export class ValueRef {
  readonly id: Id;
  constructor(id: Id) {
    this.id = id;
  }
  get value(): Value {
    return getPool().at(this.id);
  }
}

export class Value {
  private ref: ValueRef;
  type: string;
  symbol: Option<string> = option();
  list: Option<Value[]> = option();
  children: Record<string, Value> = {};
  constructor(id: Id, type: string) {
    this.ref = new ValueRef(id);
    this.type = type;
  }
  show(stringify: boolean = true): string | object {
    const value = expandValue(this);
    return stringify ? JSON.stringify(value, undefined, 2) : value;
  }
  newValue(type: string): Value {
    return getPool().createValue(type);
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
