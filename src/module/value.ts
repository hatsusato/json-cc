import { isEmpty, objMap } from "../util";
import type { Id, Module } from "./types";

export class Done {
  done: Record<Id, Id> = {};
  set(id: Id, next?: Id): void {
    this.done[id] = next ?? id;
  }
  isDone(id: Id): boolean {
    return id in this.done;
  }
}

export interface IdRef {
  id: Id;
  module: Module;
}

export class ValueRef {
  readonly id: Id;
  private module: Module;
  constructor(id: Id, module: Module) {
    this.id = id;
    this.module = module;
  }
  get value(): Value {
    return this.module.at(this.id);
  }
}

export class Value {
  idref: IdRef;
  type: string;
  symbol?: string;
  list?: Value[];
  children: Record<string, Value> = {};
  constructor(module: Module, id: Id, type: string) {
    this.idref = { id, module };
    this.type = type;
  }
  show(stringify: boolean = true): string | object {
    const value = new ExpandVisitor().visit(this);
    return stringify ? JSON.stringify(value, undefined, 2) : value;
  }
}

class ExpandVisitor extends Done {
  visit(value: Value): object {
    const { id } = value.idref;
    if (this.isDone(id)) return { ref: id };
    else this.set(id);
    const { idref, children, list, ...rest } = value;
    return {
      id,
      ...rest,
      ...(isEmpty(list) ? {} : { list: list?.map((v) => this.visit(v)) }),
      children: objMap(children, ([, v]) => this.visit(v)),
    };
  }
}
