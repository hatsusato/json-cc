import assert from "assert";
import {
  PRecord,
  asDefined,
  definedMap,
  isArray,
  isDefined,
  isNumber,
  isString,
  objMap,
  toArray,
  toNumber,
} from "./util";

export type Id = number;
export type IdValue = Id | Id[];
export type NodeValue = PRecord<string, IdValue>;
export type NodeParams = {
  type: string;
  token?: string;
  value?: NodeValue;
};
export class ModuleNode {
  type: string;
  token: string;
  value: NodeValue;
  constructor(args: NodeParams) {
    const { type, token, value } = args;
    [this.type, this.token, this.value] = [type, token ?? "", value ?? {}];
  }
  update(args: {
    type: string;
    token?: string;
    value?: NodeValue;
  }): ModuleNode {
    const { type, token, value } = args;
    [this.type, this.token, this.value] = [type, token ?? "", value ?? {}];
    return this;
  }
}
class CheckList {
  private list: Record<Id, true> = {};
  check(id: Id): boolean {
    const old = id in this.list;
    this.list[id] = true;
    return old;
  }
  has(id: Id): boolean {
    return id in this.list;
  }
}
const idMap = <T>(x: IdValue, f: (x: Id) => T): T | T[] =>
  isNumber(x) ? f(x) : isArray(x) ? x.map(f) : x;

export class ModuleElem extends ModuleNode {
  readonly id: Id;
  constructor(args: { id: Id } & NodeParams) {
    super(args);
    this.id = args.id;
  }
}
class NodeList {
  protected list: ModuleElem[] = [];

  inside(id: Id): boolean {
    return id < this.list.length;
  }

  push(node: NodeParams): Id {
    const id = this.list.length;
    this.list.push(new ModuleElem({ ...node, id }));
    return id;
  }

  at(id: Id): ModuleElem {
    assert(this.inside(id));
    return this.list[id];
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
  private done: CheckList = new CheckList();
  private list: NodeList;
  constructor(list: NodeList) {
    this.list = list;
  }
  expand(id: Id): Record<string, unknown> {
    if (this.done.check(id)) {
      return { ref: id, type: this.list.at(id).type };
    }
    const { type, token, value } = this.list.at(id);
    const f = (id: IdValue): unknown => idMap(id, this.expand.bind(this));
    return { type, ...(token === "" ? { token } : {}), ...objMap(value, f) };
  }
}

export class Module extends NodeList {
  private top?: Id;
  private history: string[] = [];
  private source?: string;

  getTop(): Id {
    assert(isNumber(this.top) && this.inside(this.top));
    return this.top;
  }

  finish(top: Id, source: string): Module {
    [this.top, this.source] = [top, source];
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

  emitHeader(): string {
    assert(isString(this.source));
    const datalayout =
      "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-f80:128-n8:16:32:64-S128";
    const triple = "x86_64-unknown-linux-gnu";
    return [
      `source_filename = "${this.source}"`,
      `target datalayout = "${datalayout}"`,
      `target triple = "${triple}"`,
    ].join("\n");
  }
}

export class ElemAccessor {
  private origin: Id;
  private current?: IdValue;
  private list: NodeList;
  constructor(list: NodeList, id: Id) {
    [this.list, this.origin, this.current] = [list, id, id];
  }
  at(key: string): ElemAccessor {
    this.current = definedMap(
      toNumber(this.current),
      (id) => this.list.at(id).value[key]
    );
    return this;
  }
  choose(index: number): ElemAccessor {
    this.current = definedMap(toArray(this.current), (list) =>
      index < list.length ? list[index] : undefined
    );
    return this;
  }
  get(): ModuleElem | undefined {
    return definedMap(toNumber(this.reset()), (id) => this.list.at(id));
  }
  getDefined(): ModuleElem {
    return asDefined(this.get());
  }
  push(node: NodeParams): Id {
    return this.list.push(node);
  }
  reset(): IdValue | undefined {
    const id = this.current;
    this.current = this.origin;
    return id;
  }
}
export interface Transformer {
  tag: string;
  apply(accessor: ElemAccessor): void;
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
    this.transfomer.apply(new ElemAccessor(this.next, id));
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
    if (this.done.check(id)) {
      return;
    }
    const elem = this.module.at(id);
    const f = this.visit.bind(this);
    const children =
      this.visitor.apply(elem, this.module) ?? Object.keys(elem.value);
    children.forEach((key) => idMap(asDefined(elem.value[key]), f));
  }
}
