import assert from "assert";
import { objMap } from "../util";
import {
  type Id,
  type IdValue,
  type NodeParams,
  type NodeValue,
} from "./types";
import { CheckList, idMap } from "./util";

export class Node implements Required<NodeParams> {
  type: string;
  token: string;
  value: NodeValue;
  constructor(args: NodeParams) {
    const { type, token, value } = args;
    [this.type, this.token, this.value] = [type, token ?? "", value ?? {}];
  }
  update(args: NodeParams): Node {
    const { type, token, value } = args;
    [this.type, this.token, this.value] = [type, token ?? "", value ?? {}];
    return this;
  }
}
export class NodeElem extends Node {
  readonly id: Id;
  constructor(args: { id: Id } & NodeParams) {
    super(args);
    this.id = args.id;
  }
}
export class NodeList {
  protected list: NodeElem[] = [];

  inside(id: Id): boolean {
    return id < this.list.length;
  }

  push(node: NodeParams): Id {
    const id = this.list.length;
    this.list.push(new NodeElem({ ...node, id }));
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
