import assert from "assert";
import { isDefined, objMap, option } from "../util";
import { type Id, type Option, type Transform } from "./types";
import { Value } from "./value";

export class Module {
  private list: Value[] = [];
  private top: Option<Id> = option();
  createValue(type: string): Value {
    const id = this.list.length;
    const value = new Value(id, type);
    this.list.push(value);
    return value;
  }
  cloneValue(value: Value): Value {
    const clone = this.createValue(value.type);
    if (isDefined(value.list)) clone.list = value.list;
    if (isDefined(value.symbol)) clone.symbol = value.symbol;
    return clone;
  }
  show(): string {
    return JSON.stringify(this.list, undefined, 2);
  }
  setTop(id: Id): void {
    this.top = option(id);
  }
  at(id: Id): Value {
    const value = this.list[id];
    assert(isDefined(value));
    return value;
  }
  transform<T extends Transform>(Class: new () => T): T {
    const transform = new Class();
    const visitor = new TransformVisitor(this, transform);
    this.setTop(visitor.visit(this.top.value));
    return transform;
  }
}
class TransformVisitor {
  module: Module;
  transform: Transform;
  done: Record<Id, Id> = {};
  constructor(module: Module, transform: Transform) {
    this.module = module;
    this.transform = transform;
  }
  visit(id: Id): Id {
    if (id in this.done) return this.done[id];
    const value = this.module.at(id);
    const next = this.module.cloneValue(value);
    this.done[id] = next.id;
    if (isDefined(value.list)) next.list = value.list.map((x) => this.visit(x));
    next.children = objMap(value.children, ([_, id]) =>
      id.map((x) => this.visit(x))
    );
    this.transform.apply(next);
    return next.id;
  }
}
