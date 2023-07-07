import { type Id, type Option } from "./types";

export class Value {
  id: Id;
  type: string;
  symbol?: string;
  list?: Id[];
  children: Partial<Record<string, Option<Id>>>;
  constructor(id: Id, type: string) {
    this.id = id;
    this.type = type;
    this.children = {};
  }
}
