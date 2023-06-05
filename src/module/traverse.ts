import assert from "assert";
import { isDefined, objMap, option, toArray, toNumber } from "../util";
import { CheckList, NodeList, idMap } from "./list";
import { Module } from "./module";
import {
  type Id,
  type IdValue,
  type NodeElem,
  type NodeParams,
  type Transformer,
  type Visitor,
} from "./types";

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
    option(this.visitor.apply(elem, this.module))
      .or(Object.keys(elem.value))
      .map((key) => option(elem.value[key]))
      .forEach((id) => id.map((id) => idMap(id, this.visit.bind(this))));
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
    this.current = option(this.current)
      .map(toNumber)
      .map((id) => this.list.at(id).value[key]).value;
    return this;
  }
  choose(index: number): ElemAccessor {
    this.current = option(this.current)
      .map(toArray)
      .map((list) => (index < list.length ? list[index] : undefined)).value;
    return this;
  }
  get(): NodeElem | undefined {
    return option(this.reset())
      .map(toNumber)
      .map((id) => this.list.at(id)).value;
  }
  getDefined(): NodeElem {
    return option(this.get()).get;
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
