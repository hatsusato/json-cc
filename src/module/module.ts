import assert from "assert";
import { isDefined, isEmpty, objMap, option } from "../util";
import { type Id, type Option, type Transform } from "./types";
import { Value } from "./value";

type Done = Record<Id, Id>;

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
  expand(id: Id): object {
    const visitor = new ExpandVisitor(this);
    return visitor.visit(id);
  }
  show(id?: Id, stringify: boolean = true): string | object {
    const obj = this.expand(id ?? this.top.value);
    return stringify ? JSON.stringify(obj, undefined, 2) : obj;
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

class ExpandVisitor {
  module: Module;
  done: Done = {};
  constructor(module: Module) {
    this.module = module;
  }
  visit(id: Id): object {
    if (id in this.done) return { ref: id };
    this.done[id] = id;
    const { module: _, children, list, ...value } = this.module.at(id);
    return {
      ...value,
      ...(isEmpty(list) ? {} : { list: list?.map((x) => this.visit(x.id)) }),
      children: objMap(children, ([, v]) => this.visit(v.id)),
    };
  }
}
