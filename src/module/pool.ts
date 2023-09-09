import assert from "assert";
import { isDefined } from "../util";
import { Node } from "./node";
import type { Id } from "./types";

export class NodePool {
  private list: Node[] = [];
  createNode(type: string): Node {
    const id = this.list.length;
    const node = new Node(id, type);
    this.list.push(node);
    return node;
  }
  at(id: Id): Node {
    const node = this.list[id];
    assert(isDefined(node));
    return node;
  }
}
const globalPool = new NodePool();
export const getPool = () => globalPool;
