import assert from "assert";
import { isArray, isNumber, objMap } from "../util";
import {
  type Id,
  type IdValue,
  type Node,
  type NodeElem,
  type NodeParams,
} from "./types";

export const idMap = <T>(x: IdValue, f: (x: Id) => T): T | T[] =>
  isNumber(x) ? f(x) : isArray(x) ? x.map(f) : x;
const normalize = (node: NodeParams): Node => {
  const { type, token, value } = node;
  return { type, token: token ?? "", value: value ?? {} };
};
export const updateElem = (elem: NodeElem, node: NodeParams): NodeElem => {
  const { type, token, value } = normalize(node);
  [elem.type, elem.token, elem.value] = [type, token, value];
  return elem;
};
export class NodeList {
  protected list: NodeElem[] = [];

  inside(id: Id): boolean {
    return id < this.list.length;
  }

  push(node: NodeParams): Id {
    const id = this.list.length;
    const elem = this.list.push({ ...normalize(node), id });
    return id;
  }

  at(id: Id): NodeElem {
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
export class CheckList {
  private list: Record<Id, true> = {};
  check(id: Id): boolean {
    const old = id in this.list;
    this.list[id] = true;
    return old;
  }
}
