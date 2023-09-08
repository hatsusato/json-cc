import assert from "assert";
import { isDefined } from "../util";
import type { Id } from "./types";
import { Value } from "./value";

export class ValuePool {
  private list: Value[] = [];
  private top: Value;
  constructor() {
    this.top = this.createValue("top");
  }
  createValue(type: string): Value {
    const id = this.list.length;
    const value = new Value(id, type);
    this.list.push(value);
    return value;
  }
  getTop(): Value {
    return this.top;
  }
  at(id: Id): Value {
    const value = this.list[id];
    assert(isDefined(value));
    return value;
  }
}
const globalPool = new ValuePool();
export const getPool = () => globalPool;
