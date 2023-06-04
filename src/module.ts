import assert from "assert";
import { Option } from "./option";
import {
  PRecord,
  asDefined,
  isArray,
  isDefined,
  isNumber,
  isString,
  objMap,
} from "./util";

export type Id = number;
export type IdValue = Id | Id[];
export type NodeValue = PRecord<string, IdValue>;
export class ModuleNode {
  type: string;
  token: Option<string>;
  value: NodeValue;
  constructor(args: { type: string; token: Option<string>; value: NodeValue }) {
    this.type = args.type;
    this.token = args.token;
    this.value = args.value;
  }
}
class CheckList {
  list: Record<Id, true> = {};
  check(id: Id): void {
    this.list[id] = true;
  }
  has(id: Id): boolean {
    return id in this.list;
  }
}
const idMap = <T>(x: IdValue, f: (x: Id) => T): T | T[] =>
  isNumber(x) ? f(x) : isArray(x) ? x.map(f) : x;

export class ModuleElem extends ModuleNode {
  id: Id;
  constructor(args: { id: Id } & ModuleNode) {
    super(args);
    this.id = args.id;
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

  show(id: Id): string {
    const result = new ListExpander(this).expand(id);
    return JSON.stringify(result, undefined, 2);
  }

  protected setList(other: NodeList): void {
    this.list = other.list;
  }
}
class ListExpander {
  done: CheckList = new CheckList();
  list: NodeList;
  constructor(list: NodeList) {
    this.list = list;
  }
  expand(id: Id): Record<string, unknown> {
    if (this.done.has(id)) {
      return { ref: id, type: this.list.at(id).type };
    }
    this.done.check(id);
    const { type, token, value } = this.list.at(id);
    const tokenSingleton = isString(token) ? { token } : {};
    const f = (id: IdValue): unknown => idMap(id, this.expand.bind(this));
    return { type, ...tokenSingleton, ...objMap(value, f) };
  }
}

export class Module extends NodeList {
  top?: Id;
  history: string[] = [];
  source?: string;

  getTop(): Id {
    assert(isNumber(this.top) && this.inside(this.top));
    return this.top;
  }

  finish(top: Id, source: string): Module {
    this.top = top;
    this.source = source;
    return this;
  }

  transform<T extends Transformer>(Class: new () => T, id?: Id): T {
    const transformer = new Class();
    const manager = new TransformerManager(this, transformer);
    const [top, list] = manager.run(id ?? this.getTop());
    this.setList(list);
    this.top = top;
    this.history.push(transformer.tag);
    return transformer;
  }

  visit<T extends Visitor>(Class: new () => T, id?: Id): T {
    const visitor = new Class();
    const manager = new VisitorManager(this, visitor);
    manager.visit(id ?? this.getTop());
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

export class ModuleAdoptor {
  get: (id: Id) => ModuleElem;
  push: (node: ModuleNode) => Id;
  show: (id: Id) => string;
  constructor(list: NodeList) {
    this.get = list.at.bind(list);
    this.push = list.push.bind(list);
    this.show = list.show.bind(list);
  }
}
export interface Transformer {
  tag: string;
  apply(elem: ModuleElem, adoptor: ModuleAdoptor): void;
}
class TransformerManager {
  readonly prev: NodeList;
  next: NodeList = new NodeList();
  table: Record<Id, Id> = {};
  transfomer: Transformer;

  constructor(module: Module, transformer: Transformer) {
    this.prev = module;
    this.transfomer = transformer;
  }

  run(id: Id): [Id, NodeList] {
    id = this.findNext(id);
    assert(isDefined(id));
    return [id, this.next];
  }

  private initNext(prevId: Id): Id {
    const { type, token, value } = this.prev.at(prevId);
    this.table[prevId] = this.next.push({ type, token, value: {} });
    const nextId = this.table[prevId];
    const f = (id: IdValue): IdValue => idMap(id, this.findNext.bind(this));
    this.next.at(nextId).value = objMap(value, f);
    return nextId;
  }

  private findNext(id: Id): Id {
    if (id in this.table) {
      return this.table[id];
    }
    id = this.initNext(id);
    const adoptor = new ModuleAdoptor(this.next);
    this.transfomer.apply(adoptor.get(id), adoptor);
    return id;
  }
}

export interface Visitor {
  apply: (node: ModuleElem, module: Module) => string[] | undefined;
}
class VisitorManager {
  readonly module: Module;
  done: CheckList = new CheckList();
  visitor: Visitor;

  constructor(module: Module, visitor: Visitor) {
    this.module = module;
    this.visitor = visitor;
  }

  visit(id: Id): void {
    if (this.done.has(id)) {
      return;
    } else {
      this.done.check(id);
    }
    const node = this.module.at(id);
    const f = this.visit.bind(this);
    const children =
      this.visitor.apply(node, this.module) ?? Object.keys(node.value);
    children.forEach((key) => idMap(asDefined(node.value[key]), f));
  }
}
