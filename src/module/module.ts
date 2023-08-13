import assert from "assert";
import type { Done, Id, Option, Transform } from "./types";
import { isDefined, objMap, option } from "./util";
import { Value } from "./value";

export class Module {
  private list: Value[] = [];
  private top: Option<Id> = option();
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
  getTop(): Id {
    return this.top.value;
  }
  setTop(id: Id): void {
    this.top = option(id);
  }
  at(id: Id): Value {
    const value = this.list[id];
    assert(isDefined(value));
    return value;
  }
  transform<T extends Transform>(Classes: (new () => T)[]): void {
    Classes.forEach((Class) => {
      const transform = new Class();
      const visitor = new TransformVisitor(this, transform);
      const top = visitor.visit(this.top.value);
      this.setTop(top.id);
    });
  }
}

class TransformVisitor {
  module: Module;
  transform: Transform;
  done: Done = {};
  constructor(module: Module, transform: Transform) {
    this.module = module;
    this.transform = transform;
  }
  visit(id: Id): Value {
    const value = this.module.at(id);
    if (id in this.done) return value;
    else this.done[id] = id;
    const recurse = () => {
      if (isDefined(value.list)) {
        value.list = value.list.map((v) => this.visit(v.id));
      }
      value.children = objMap(value.children, ([_, v]) => this.visit(v.id));
    };
    return this.transform.apply(value, recurse) ?? value;
  }
}
