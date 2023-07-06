import { Value } from "./value";

export class Module {
  list: Value[] = [];
  createValue(type: string): Value {
    const id = this.list.length;
    const value = new Value(id, type);
    this.list.push(value);
    return value;
  }
  show(): string {
    return JSON.stringify(this.list, undefined, 2);
  }
}
