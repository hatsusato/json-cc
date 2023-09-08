import { objMap } from "../util";
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
  apply(value: Value, visit: () => void): void;
}

class TransformVisitor extends Done {
  transform: Transform;
  constructor(transform: Transform) {
    super();
    this.transform = transform;
  }
  visit(value: Value): void {
    const id = value.id;
    if (this.isDone(id)) return;
    else this.set(id);
    const recurse = () => {
      if (value.list.ok) {
        value.list.unwrap().forEach((v) => this.visit(v));
      }
      objMap(value.children, ([_, v]) => this.visit(v));
    };
    this.transform.apply(value, recurse);
  }
}
export const applyTransforms = <T extends Transform>(
  top: Value,
  Classes: (new () => T)[]
): void => {
  Classes.forEach((Class) => {
    new TransformVisitor(new Class()).visit(top);
  });
};

class ExpandVisitor extends Done {
  visit(value: Value): object {
    const id = value.id;
    if (this.isDone(id)) return { ref: id };
    else this.set(id);
    const { children, list, type, symbol } = value;
    return {
      id,
      type,
      ...(symbol.ok ? { symbol: symbol.unwrap() } : {}),
      ...(list.ok ? { list: list.unwrap().map((v) => this.visit(v)) } : {}),
      children: objMap(children, ([, v]) => this.visit(v)),
    };
  }
}
export const expandValue = (value: Value): object => {
  return new ExpandVisitor().visit(value);
};
