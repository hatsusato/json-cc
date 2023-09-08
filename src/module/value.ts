import { assert } from "console";
import { Option, option } from "../util";
import type { Id, ValuePool } from "./types";
import { expandValue } from "./visit";

export class ValueRef {
  readonly id: Id;
  private readonly pool: ValuePool;
  constructor(id: Id, pool: ValuePool) {
    this.id = id;
    this.pool = pool;
  }
  get value(): Value {
    return this.pool.at(this.id);
  }
}

export class Value {
  private ref: ValueRef;
  private pool: ValuePool;
  type: string;
  symbol: Option<string> = option();
  list: Option<Value[]> = option();
  children: Record<string, Value> = {};
  constructor(pool: ValuePool, id: Id, type: string) {
    this.ref = new ValueRef(id, pool);
    this.pool = pool;
    this.type = type;
  }
  show(stringify: boolean = true): string | object {
    const value = expandValue(this);
    return stringify ? JSON.stringify(value, undefined, 2) : value;
  }
  clone(): Value {
    return this.pool.cloneValue(this);
  }
  newValue(type: string): Value {
    return this.pool.createValue(type);
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
