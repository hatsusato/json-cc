import assert from "assert";
import { isDefined } from "../util";
import { Node, newModule } from "./node";
import type { Id } from "./types";

export class NodePool {
  private pool: Node[] = [];
  private null: Node;
  private module: Node;
  constructor() {
    this.null = this.createNode("null");
    this.module = this.null;
  }
  createNode(type: string): Node {
    const id = this.pool.length;
    const node = new Node(id, type);
    this.pool.push(node);
    return node;
  }
  initModule(source: string) {
    this.module = newModule(source);
  }
  getModule(): Node {
    return this.module;
  }
  getNull(): Node {
    return this.null;
  }
  at(id: Id): Node {
    const node = this.pool[id];
    assert(isDefined(node));
    return node;
  }
}
const globalPool = new NodePool();
export const getPool = () => globalPool;
export const getNull = () => getPool().getNull();
