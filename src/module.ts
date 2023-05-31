import assert from "assert";
import { combineObjects, makeSingleton, smartMap } from "./util";

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

  get(key: string): IdValue {
    return key in this.value ? this.value[key] : null;
  }

  clone(value?: NodeValue): ModuleNode {
    return new ModuleNode({ ...this, value: value ?? {} });
  }
}

type TransformMap = (
  node: ModuleNode,
  get: (id: Id) => ModuleNode
) => ModuleNode | undefined;
type VisitorMap = (node: ModuleNode) => string[];
export class Module {
  root: ModuleNode[] = [];
  age: number = 0;
  source: string;

  constructor(list: ModuleNode[], top: Id, source: string) {
    const t = new Transformer(list, () => undefined);
    t.transform(top);
    this.root = t.next;
    this.source = source;
  }

  transform(map: TransformMap): void {
    const t = new Transformer(this.root, map);
    t.transform(0);
    this.root = t.next;
    this.age += 1;
  }

  visit(map: VisitorMap): void {
    new Visitor(this.root, map).visit(0);
  }

  emitHeader(): string[] {
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
  readonly prev: ModuleNode[];
  next: ModuleNode[] = [];
  table: Record<Id, Id> = {};
  readonly map: TransformMap;

  constructor(prev: ModuleNode[], map: TransformMap) {
    this.prev = prev;
    this.map = map;
  }

  transform(id: Id): Id {
    assert(!this.done(id));
    const [nextId, prevNode] = this.prepareNext(id);
    const nextNode = this.getNext(prevNode);
    this.next[nextId] = nextNode ?? this.getDefaultNext(prevNode);
    return nextId;
  }

  private prepareNext(prevId: Id): [Id, ModuleNode] {
    assert(prevId < this.prev.length);
    const prevNode = this.prev[prevId];
    const nextId = this.next.length;
    this.next.push(prevNode.clone());
    this.table[prevId] = nextId;
    return [nextId, prevNode];
  }

  private getNext(prevNode: ModuleNode): ModuleNode | undefined {
    return this.map(prevNode, (id) => this.next[this.get(id)]);
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
