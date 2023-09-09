import { objMap } from "../util";
import { getPool } from "./pool";
import type { Id, Node } from "./types";

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
  apply(node: Node, visit: () => void): void;
}

class TransformVisitor extends Done {
  transform: Transform;
  constructor(transform: Transform) {
    super();
    this.transform = transform;
  }
  visit(node: Node): void {
    const id = node.id;
    if (this.isDone(id)) return;
    else this.set(id);
    const recurse = () => {
      if (node.list.ok) {
        node.list.unwrap().forEach((v) => this.visit(v));
      }
      objMap(node.children, ([_, v]) => this.visit(v));
    };
    this.transform.apply(node, recurse);
  }
}
export const applyTransforms = <T extends Transform>(
  Classes: (new () => T)[]
): void => {
  const top = getPool().getTop();
  Classes.forEach((Class) => {
    new TransformVisitor(new Class()).visit(top);
  });
};

class ExpandVisitor extends Done {
  visit(node: Node): object {
    const id = node.id;
    if (this.isDone(id)) return { ref: id };
    else this.set(id);
    const { children, list, type, symbol } = node;
    return {
      id,
      type,
      ...(symbol.ok ? { symbol: symbol.unwrap() } : {}),
      ...(list.ok ? { list: list.unwrap().map((v) => this.visit(v)) } : {}),
      children: objMap(children, ([, v]) => this.visit(v)),
    };
  }
}
export const expandNode = (node: Node): object => {
  return new ExpandVisitor().visit(node);
};
