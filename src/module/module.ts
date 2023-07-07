import { option } from "../util";
import { type Id, type Option } from "./types";
import { Value } from "./value";

export class Module {
  list: Value[] = [];
  top: Option<Id> = option();
  createValue(type: string): Value {
    const id = this.list.length;
    const value = new Value(id, type);
    this.list.push(value);
    return value;
  }
  show(): string {
    return JSON.stringify(this.list, undefined, 2);
  }
  setTop(id: Id): void {
    this.top = option(id);
  }
}
