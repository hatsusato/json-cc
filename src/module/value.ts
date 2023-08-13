import { type Id, type Module } from "./types";

export class Value {
  module: Module;
  id: Id;
  type: string;
  symbol?: string;
  list?: Value[];
  children: Record<string, Value>;
  constructor(module: Module, id: Id, type: string) {
    this.module = module;
    this.id = id;
    this.type = type;
    this.children = {};
  }
  show(stringify: boolean = true): string | object {
    return this.module.show(this.id, stringify);
  }
}
