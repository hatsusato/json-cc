import { Id } from "./type";

export class Value {
  id: Id;
  type: string;
  symbol?: string;
  list?: Id[];
  children: Partial<Record<string, Id>>;
  constructor(id: Id, type: string) {
    this.id = id;
    this.type = type;
    this.children = {};
  }
}
