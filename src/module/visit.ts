import { isDefined, objMap } from "../util";
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
  filter?: string;
  apply(node: Node, visit: () => void): void;
}

class TransformVisitor extends Done {
  transform: Transform;
  constructor(transform: Transform) {
    super();
    this.transform = transform;
  }
  recurse(node: Node, found: boolean) {
    if (node.leaf.type === "list") {
      node.leaf.list.forEach((v) => this.visit(v, found));
    }
    objMap(node.children, ([_, v]) => this.visit(v, found));
  }
  visit(node: Node, found: boolean): void {
    const id = node.id;
    if (this.isDone(id)) return;
    else this.set(id);
    if (found || this.transform.filter === node.type) {
      this.transform.apply(node, () => this.recurse(node, true));
    } else {
      this.recurse(node, false);
    }
  }
}
export const applyTransform = <T extends Transform>(
  translation_unit: Node,
  Class: new () => T
): void => {
  const instance = new Class();
  new TransformVisitor(instance).visit(
    translation_unit,
    !isDefined(instance.filter)
  );
};

class ExpandVisitor extends Done {
  visit(node: Node): object {
    const id = node.id;
    if (this.isDone(id)) return { ref: id };
    else this.set(id);
    const { children, leaf, type } = node;
    return {
      id,
      type,
      ...(leaf.type === "symbol"
        ? { symbol: leaf.symbol }
        : leaf.type === "list"
        ? { list: leaf.list.map((v) => this.visit(v)) }
        : {}),
      children: objMap(children, ([, v]) => this.visit(v)),
    };
  }
}
export const expandNode = (node: Node): object => {
  return new ExpandVisitor().visit(node);
};
