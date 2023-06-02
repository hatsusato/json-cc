import assert from "assert";
import {
  combineObjects,
  isNumber,
  isString,
  makeSingleton,
  smartMap,
} from "./util";

export type Id = number;
export type IdValue = Id | Id[] | null;

export type NodeValue = Record<string, IdValue>;
class NodeParams {
  type: string;
  token: string | null;
  value: NodeValue;
  constructor(args: { type: string; token: string | null; value: NodeValue }) {
    this.type = args.type;
    this.token = args.token;
    this.value = args.value;
  }
}
export class ModuleNode extends NodeParams {
  id: Id;
  constructor(args: { id: Id } & NodeParams) {
    super(args);
    this.id = args.id;
  }

  get(key: string): IdValue {
    return key in this.value ? this.value[key] : null;
  }

  clone(value?: NodeValue): ModuleNode {
    return new ModuleNode({ ...this, value: value ?? {} });
  }

  setType(type: string): void {
    this.type = type;
  }

  update(node: NodeParams): void {
    this.type = node.type;
    this.token = node.token;
    this.value = node.value;
  }
}

class NodeList {
  list: ModuleNode[] = [];

  inside(id: Id): boolean {
    return id < this.list.length;
  }

  push(node: NodeParams): Id {
    const id = this.list.length;
    this.list.push(new ModuleNode({ ...node, id }));
    return id;
  }

  at(id: Id): ModuleNode {
    assert(this.inside(id));
    const node = this.list[id];
    assert(node.id === id);
    return node;
  }

  set(id: Id, node: NodeParams): void {
    assert(this.inside(id) && this.list[id].id === id);
    this.list[id].update(node);
  }
}

type TransformMap = (
  node: ModuleNode,
  get: (id: Id) => ModuleNode
) => ModuleNode | undefined;
type VisitorMap = (node: ModuleNode) => string[];
export class Module extends NodeList {
  // private list: NodeList = new NodeList();
  private top?: Id;
  private age: number = 0;
  private source?: string;

  getTop(): Id {
    assert(isNumber(this.top) && this.inside(this.top));
    return this.top;
  }

  finish(top: Id, source: string): Module {
    const t = new Transformer(this, () => undefined);
    this.top = t.transform(top);
    this.list = t.next.list;
    this.source = source;
    return this;
  }

  transform(map: TransformMap): void {
    const t = new Transformer(this, map);
    t.transform(0);
    this.list = t.next.list;
    this.age += 1;
  }

  visit(map: VisitorMap): void {
    new Visitor(this.list, map).visit(0);
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

  transform(id: Id): Id {
    assert(!this.done(id));
    const [nextId, prevNode] = this.prepareNext(id);
    const nextNode = this.getNext(prevNode);
    this.next.set(nextId, nextNode ?? this.getDefaultNext(prevNode));
    return nextId;
  }

  private prepareNext(prevId: Id): [Id, ModuleNode] {
    const prevNode = this.prev.at(prevId);
    const nextId = this.next.push(prevNode.clone());
    this.table[prevId] = nextId;
    return [nextId, prevNode];
  }

  private getNext(prevNode: ModuleNode): ModuleNode | undefined {
    return this.map(prevNode, (id) => this.next.at(this.get(id)));
  }

  private getDefaultNext(prevNode: ModuleNode): ModuleNode {
    const get = (id: Id): Id => this.get(id);
    const nextEntries = Object.entries(prevNode.value).map(([k, v]) =>
      makeSingleton(k, smartMap(v, get))
    );
    return prevNode.clone(combineObjects<string, IdValue>(nextEntries));
  }

  private done(id: Id): boolean {
    return id in this.table;
  }

  private get(id: Id): Id {
    return this.done(id) ? this.table[id] : this.transform(id);
  }
}

class Visitor {
  readonly root: ModuleNode[];
  readonly map: VisitorMap;

  constructor(root: ModuleNode[], map: VisitorMap) {
    this.root = root;
    this.map = map;
  }

  visit(id: Id): void {
    assert(id < this.root.length);
    const node = this.root[id];
    const visit = (id: Id): void => {
      this.visit(id);
    };
    this.map(node).forEach((key) => smartMap(node.get(key), visit));
  }
}
