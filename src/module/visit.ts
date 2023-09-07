import { isDefined, isEmpty, objMap } from "../util";
import type { Id, Value } from "./types";

class Done {
  done: Record<Id, Id> = {};
  set(id: Id, next?: Id): void {
    this.done[id] = next ?? id;
  }
  isDone(id: Id): boolean {
    return id in this.done;
  }
}

export interface Transform {
  readonly tag: string;
  apply(value: Value, visit: () => void): Value | void;
}

export class TransformVisitor extends Done {
  transform: Transform;
  constructor(transform: Transform) {
    super();
    this.transform = transform;
  }
  visit(value: Value): Value {
    const id = value.id;
    if (this.isDone(id)) return value;
    else this.set(id);
    const recurse = () => {
      if (isDefined(value.list)) {
        value.list = value.list.map((v) => this.visit(v));
      }
      value.children = objMap(value.children, ([_, v]) => this.visit(v));
    };
    return this.transform.apply(value, recurse) ?? value;
  }
}

export class ExpandVisitor extends Done {
  visit(value: Value): object {
    const id = value.id;
    if (this.isDone(id)) return { ref: id };
    else this.set(id);
    const { children, list, type, symbol } = value;
    return {
      id,
      type,
      ...(isDefined(symbol) ? { symbol } : {}),
      ...(isEmpty(list) ? {} : { list: list?.map((v) => this.visit(v)) }),
      children: objMap(children, ([, v]) => this.visit(v)),
    };
  }
}
