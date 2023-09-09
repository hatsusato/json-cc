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
  apply(node: Node, visit: (cont: boolean | Node) => void): void;
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
    if (found || this.transform.filter === node.type) {
      if (this.isDone(node.id)) return;
      else this.set(node.id);
      let called = false;
      this.transform.apply(node, (cont: boolean | Node) => {
        if (typeof cont === "boolean") {
          if (cont) this.recurse(node, true);
        } else {
          this.visit(cont, true);
        }
        called = true;
      });
      if (!called) this.recurse(node, true);
    } else {
      this.recurse(node, false);
    }
  }
}
export const applyTransform = (
  translation_unit: Node,
  transform: Transform
): void => {
  new TransformVisitor(transform).visit(
    translation_unit,
    !isDefined(transform.filter)
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
        : leaf.type === "flag"
        ? { flag: leaf.flag }
        : leaf.type === "ref"
        ? { ref: leaf.ref }
        : {}),
      children: objMap(children, ([, v]) => this.visit(v)),
    };
  }
}
export const expandNode = (node: Node): object => {
  return new ExpandVisitor().visit(node);
};
