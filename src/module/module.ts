import assert from "assert";
import type { Id } from "./types";
import { Option, isDefined, objMap, option } from "./util";
import { Done, Value } from "./value";

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
      const top = visitor.visit(this.top.value);
      this.setTop(top);
    });
  }
}

export interface Transform {
  readonly tag: string;
  apply(value: Value, visit: () => void): Value | void;
}

class TransformVisitor extends Done {
  transform: Transform;
  constructor(transform: Transform) {
    super();
    this.transform = transform;
  }
  visit(value: Value): Value {
    const { id } = value.idref;
    if (this.isDone(id)) return value;
    else this.set(id);
    const recurse = () => {
      if (isDefined(value.list)) {
        value.list = value.list.map((v) => this.visit(v));
      }
      value.children = objMap(value.children, ([_, v]) => this.visit(v));
    };
    return this.transform.apply(value, recurse) ?? value;
  }
}
