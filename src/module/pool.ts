import assert from "assert";
import { isDefined } from "../util";
import { Node } from "./node";
import type { Id } from "./types";

export class NodePool {
  private pool: Node[] = [];
  createNode(type: string): Node {
    const id = this.pool.length;
    const node = new Node(id, type);
    this.pool.push(node);
    return node;
  }
  at(id: Id): Node {
    const node = this.pool[id];
    assert(isDefined(node));
    return node;
  }
}
const globalPool = new NodePool();
export const getPool = () => globalPool;
