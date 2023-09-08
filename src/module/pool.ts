import assert from "assert";
import { isDefined } from "../util";
import { AstVisitor } from "./ast";
import type { Id, Transform } from "./types";
import { Value } from "./value";
import { applyTransforms } from "./visit";

export class ValuePool {
  private list: Value[] = [];
  private top: Value;
  constructor() {
    this.top = this.createValue("top");
  }
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
    return this.top;
  }
  at(id: Id): Value {
    const value = this.list[id];
    assert(isDefined(value));
    return value;
  }
  transform<T extends Transform>(Classes: (new () => T)[]): void {
    applyTransforms(this.top, Classes);
  }
  convert(ast: unknown) {
    const visitor = new AstVisitor(this);
    const value = visitor.visit("top", ast);
    this.top.children = value.children;
  }
}
