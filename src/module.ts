import assert from "assert";
import { isDefined, isNumber, isString, smartMap } from "./util";

export type Id = number;
export type IdValue = Id | Id[] | null;
export type NodeValue = Record<string, IdValue>;
export class ModuleNode {
  type: string;
  token: string | null;
  value: NodeValue;
  constructor(args: { type: string; token: string | null; value: NodeValue }) {
    this.type = args.type;
    this.token = args.token;
    this.value = args.value;
  }
}

class ModuleElem extends ModuleNode {
  id: Id;
  constructor(args: { id: Id } & ModuleNode) {
    super(args);
    this.id = args.id;
  }

  get(key: string): IdValue {
    return key in this.value ? this.value[key] : null;
  }

  setType(type: string): void {
    this.type = type;
  }

  update(node: ModuleNode): void {
    this.setType(node.type);
    this.token = node.token;
    this.value = node.value;
  }
}
class NodeList {
  private list: ModuleElem[] = [];

  inside(id: Id): boolean {
    return id < this.list.length;
  }

  push(node: ModuleNode): Id {
    const id = this.list.length;
    this.list.push(new ModuleElem({ ...node, id }));
    return id;
  }

  at(id: Id): ModuleElem {
    assert(this.inside(id));
    const node = this.list[id];
    assert(node.id === id);
    return node;
  }

  setNode(id: Id, node: ModuleNode): void {
    assert(this.inside(id) && this.list[id].id === id);
    this.list[id].update(node);
  }

  protected setList(other: NodeList): void {
    this.list = other.list;
  }
}

type TransformMap = (
  node: ModuleNode,
  get: (id: Id) => ModuleNode,
  push: (node: ModuleNode) => Id
) => ModuleNode | undefined;
type VisitorMap = (node: ModuleNode) => string[];

export class Module extends NodeList {
  private top?: Id;
  private age: number = 0;
  private source?: string;

  getTop(): Id {
    assert(isNumber(this.top) && this.inside(this.top));
    return this.top;
  }

  finish(top: Id, source: string): Module {
    this.top = top;
    this.source = source;
    return this;
  }

  transform(map: TransformMap): void {
    this.setList(new Transformer(this, map).transform(this.getTop()));
    this.age += 1;
  }

  visit(map: VisitorMap): void {
    new Visitor(this, map).visit(this.getTop());
  }

  emitHeader(): string[] {
    assert(isString(this.source));
    const datalayout =
      "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-f80:128-n8:16:32:64-S128";
    const triple = "x86_64-unknown-linux-gnu";
    return [
      `source_filename = "${this.source}"`,
      `target datalayout = "${datalayout}"`,
      `target triple = "${triple}"`,
    ];
  }
}

class Transformer {
  readonly prev: NodeList;
  next: NodeList = new NodeList();
  table: Record<Id, Id> = {};
  readonly map: TransformMap;

  constructor(prev: NodeList, map: TransformMap) {
    this.prev = prev;
    this.map = map;
  }

  transform(id: Id): NodeList {
    this.apply(id);
    return this.next;
  }

  apply(id: Id): Id | undefined {
    if (id in this.table) {
      return this.table[id];
    }
    const nextNode = this.getTransformed(id);
    if (isDefined(nextNode)) {
      const f = (id: IdValue): IdValue => smartMap(id, this.apply.bind(this));
      const value = smartMap(nextNode.value, f);
      const nextId = this.next.push({ ...nextNode, value });
      this.table[id] = nextId;
      return nextId;
    }
  }

  private getTransformed(prevId: Id): ModuleNode | undefined {
    const prevNode = this.prev.at(prevId);
    const get = this.prev.at.bind(this.prev);
    const push = this.prev.push.bind(this.prev);
    return this.map(prevNode, get, push);
  }
}

class Visitor {
  readonly root: NodeList;
  readonly map: VisitorMap;

  constructor(root: NodeList, map: VisitorMap) {
    this.root = root;
    this.map = map;
  }

  visit(id: Id): void {
    assert(this.root.inside(id));
    const node = this.root.at(id);
    const visit = (id: Id): void => {
      this.visit(id);
    };
    this.map(node).forEach((key) => smartMap(node.get(key), visit));
  }
}
