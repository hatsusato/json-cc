import assert from "assert";
import { asDefined, isDefined, objMap } from "../util";
import { CheckList, NodeList, idMap } from "./list";
import { ElemAccessor, Module } from "./module";
import { Id, IdValue, type Transformer, type Visitor } from "./types";

export class TransformerManager {
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
export class VisitorManager {
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
