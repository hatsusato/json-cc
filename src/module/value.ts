import { type Id, type Module, type Option } from "./types";

export class Value {
  module: Module;
  id: Id;
  type: string;
  symbol?: string;
  list?: Id[];
  children: Record<string, Option<Id>>;
  constructor(module: Module, id: Id, type: string) {
    this.module = module;
    this.id = id;
    this.type = type;
    this.children = {};
  }
  show(): void {
    console.log(this.module.show(this.id));
  }
}
