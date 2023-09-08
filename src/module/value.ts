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
  show(): string {
    return JSON.stringify(this.showObject(), undefined, 2);
  }
  showObject(): object {
    return expandValue(this);
  }
  getSymbol(): string {
    assert(this.type === "symbol" && this.symbol.ok);
    return this.symbol.unwrap();
  }
  getList(): Value[] {
    assert(this.type === "list" && this.list.ok);
    return this.list.unwrap();
  }
}

export const newValue = (type: string) => getPool().createValue(type);
export const newSymbol = (symbol: string) => {
  const value = newValue("symbol");
  value.symbol = option(symbol);
  return value;
};
export const newList = () => {
  const value = newValue("list");
  value.list = option([]);
  return value;
};
