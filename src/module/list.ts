import assert from "assert";
import { objMap } from "../util";
import { type Id, type IdValue, type NodeElem, type NodeParams } from "./types";
import { idMap, normalize } from "./util";

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
