import { assert } from "console";
import { Option, option } from "../util";
import { getPool } from "./pool";
import type { Id } from "./types";
import { expandValue } from "./visit";

export class Value {
  id: Id;
  type: string;
  symbol: Option<string> = option();
  list: Option<Value[]> = option();
  children: Record<string, Value> = {};
  constructor(id: Id, type: string) {
    this.id = id;
    this.type = type;
  }
  show(stringify: boolean = true): string | object {
    const value = expandValue(this);
    return stringify ? JSON.stringify(value, undefined, 2) : value;
  }
  newSymbol(symbol: string): Value {
    const value = newValue("symbol");
    value.symbol = option(symbol);
    return value;
  }
  newList(): Value {
    const value = newValue("list");
    value.list = option([]);
    return value;
  }
  pushList(elem: Value): void {
    assert(this.type === "list" && this.list.ok);
    this.list.unwrap().push(elem);
  }
}

export const newValue = (type: string) => getPool().createValue(type);
