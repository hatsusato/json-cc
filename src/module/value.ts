import { Id } from "./type";
import { Option } from "./util";

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
