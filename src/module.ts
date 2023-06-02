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

export class ModuleElem extends ModuleNode {
  id: Id;
  constructor(args: { id: Id } & ModuleNode) {
    super(args);
    this.id = args.id;
  }

  get(key: string): IdValue {
    return key in this.value ? this.value[key] : null;
  }
}
class NodeList {
  list: ModuleElem[] = [];

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

  protected setList(other: NodeList): void {
    this.list = other.list;
  }
}

export class Module extends NodeList {
  top?: Id;
  age: number = 0;
  source?: string;

  getTop(): Id {
    assert(isNumber(this.top) && this.inside(this.top));
    return this.top;
  }

  show(id?: Id): string {
    return JSON.stringify(this.expand(id ?? this.getTop()), undefined, 2);
  }

  expand(id: Id): Record<string, unknown> {
    const { type, value } = this.at(id);
    const f = (id: IdValue): unknown => smartMap(id, this.expand.bind(this));
    return { type, ...smartMap(value, f) };
  }

  finish(top: Id, source: string): Module {
    this.top = top;
    this.source = source;
    return this;
  }

  transform<T extends Transformer>(Class: new () => T): T {
    const transformer = new Class();
    const manager = new TransformerManager(this, transformer);
    const [top, list] = manager.run(this.getTop());
    this.top = top;
    this.setList(list);
    this.age += 1;
    return transformer;
  }

  visit<T extends Visitor>(Class: new () => T): T {
    const visitor = new Class();
    const manager = new VisitorManager(this, visitor);
    manager.visit(this.getTop());
    return visitor;
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

export interface Transformer {
  apply: (
    id: Id,
    get: (id: Id) => ModuleElem,
    push: (node: ModuleNode) => Id,
    module: Module
  ) => ModuleNode | undefined;
}
class TransformerManager {
  readonly prev: NodeList;
  readonly module: Module;
  next: NodeList = new NodeList();
  table: Record<Id, Id> = {};
  transfomer: Transformer;

  constructor(module: Module, transformer: Transformer) {
    this.prev = module;
    this.module = module;
    this.transfomer = transformer;
  }

  run(id: Id): [Id, NodeList] {
    const nextId = this.lookup(id);
    assert(isDefined(nextId));
    return [nextId, this.next];
  }

  private lookup(id: Id): Id | undefined {
    if (!(id in this.table)) {
      const get = this.prev.at.bind(this.prev);
      const push = this.prev.push.bind(this.prev);
      const node = this.transfomer.apply(id, get, push, this.module);
      if (isDefined(node)) {
        this.table[id] = this.next.push(this.transform(node));
      }
    }
    return id in this.table ? this.table[id] : undefined;
  }

  private transform(node: ModuleNode): ModuleNode {
    const f = this.lookup.bind(this);
    const value = smartMap(node.value, (id: IdValue) => smartMap(id, f));
    return { ...node, value };
  }
}

export interface Visitor {
  apply: (node: ModuleElem, module: Module) => string[] | undefined;
}
class VisitorManager {
  readonly module: Module;
  visitor: Visitor;

  constructor(module: Module, visitor: Visitor) {
    this.module = module;
    this.visitor = visitor;
  }

  visit(id: Id): void {
    const node = this.module.at(id);
    const f = this.visit.bind(this);
    const children =
      this.visitor.apply(node, this.module) ?? Object.keys(node.value);
    children.forEach((key) => smartMap(node.get(key), f));
  }
}
