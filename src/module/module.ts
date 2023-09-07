import assert from "assert";
import { Option, isDefined, option } from "../util";
import type { Id, Transform } from "./types";
import { Value } from "./value";
import { TransformVisitor } from "./visit";

export class Module {
  private list: Value[] = [];
  private top: Option<Value> = option();
  createValue(type: string): Value {
    const id = this.list.length;
    const value = new Value(this, id, type);
    this.list.push(value);
    return value;
  }
  cloneValue(value: Value): Value {
    const clone = this.createValue(value.type);
    if (isDefined(value.list)) clone.list = value.list;
    if (isDefined(value.symbol)) clone.symbol = value.symbol;
    return clone;
  }
  getTop(): Value {
    return this.top.value;
  }
  setTop(value: Value): void {
    this.top = option(value);
  }
  at(id: Id): Value {
    const value = this.list[id];
    assert(isDefined(value));
    return value;
  }
  transform<T extends Transform>(Classes: (new () => T)[]): void {
    Classes.forEach((Class) => {
      const transform = new Class();
      const visitor = new TransformVisitor(transform);
      visitor.visit(this.top.value);
    });
  }
}
