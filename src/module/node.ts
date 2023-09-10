import assert from "assert";
import { unreachable } from "../util";
import { getPool } from "./pool";
import type { Id } from "./types";
import { expandNode } from "./visit";

type Leaf =
  | { type: "symbol"; symbol: string }
  | { type: "list"; list: Node[] }
  | { type: "number"; number: number }
  | { type: "flag"; flag: boolean }
  | { type: "ref"; ref: Id }
  | { type: "none" };

export class Node {
  id: Id;
  type: string;
  leaf: Leaf = { type: "none" };
  children: Record<string, Node> = {};
  constructor(id: Id, type: string) {
    this.id = id;
    this.type = type;
  }
  show(): string {
    return JSON.stringify(this.showObject(), undefined, 2);
  }
  showObject(): object {
    return expandNode(this);
  }
  getSymbol(): string {
    return this.leaf.type === "symbol"
      ? this.leaf.symbol
      : unreachable("no symbol");
  }
  setSymbol(symbol: string): Node {
    this.leaf = { type: "symbol", symbol };
    return this;
  }
  getList(): Node[] {
    return this.leaf.type === "list" ? this.leaf.list : unreachable("no list");
  }
  setList(list: Node[]): Node {
    this.leaf = { type: "list", list };
    return this;
  }
  getNumber(): number {
    return this.leaf.type === "number"
      ? this.leaf.number
      : unreachable("no number");
  }
  setNumber(number: number): Node {
    this.leaf = { type: "number", number };
    return this;
  }
  getFlag(): boolean {
    return this.leaf.type === "flag" ? this.leaf.flag : unreachable("no flag");
  }
  setFlag(flag: boolean): Node {
    this.leaf = { type: "flag", flag };
    return this;
  }
  getRef(): Node {
    return this.leaf.type === "ref"
      ? getPool().at(this.leaf.ref)
      : unreachable("no reference");
  }
  setRef(node: Node): Node {
    this.leaf = { type: "ref", ref: node.id };
    return this;
  }
  getBlock(): Node {
    assert(this.type === "function");
    const block = this.children.blocks.getList().at(-1);
    return block ?? newBlock(this);
  }
}

export const newNode = (type: string): Node => getPool().createNode(type);
export const newSymbol = (symbol: string): Node =>
  newNode("symbol").setSymbol(symbol);
export const newList = (list: Node[] = []): Node =>
  newNode("list").setList(list);
export const newNumber = (number: number): Node =>
  newNode("number").setNumber(number);
export const newFlag = (flag: boolean): Node => newNode("flag").setFlag(flag);
export const newRef = (node: Node): Node => newNode("ref").setRef(node);
export const newModule = (source_filename: string): Node => {
  const module = newNode("module");
  const datalayout =
    "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-f80:128-n8:16:32:64-S128";
  const triple = "x86_64-unknown-linux-gnu";
  module.children.source_filename = newSymbol(source_filename);
  module.children.datalayout = newSymbol(datalayout);
  module.children.triple = newSymbol(triple);
  module.children.functions = newList();
  return module;
};
export const newFunction = (module: Node): Node => {
  assert(module.type === "module");
  const func = newNode("function");
  func.children.blocks = newList();
  module.children.functions.getList().push(func);
  return func;
};
export const newBlock = (func: Node): Node => {
  assert(func.type === "function");
  const block = newNode("block");
  block.children.instructions = newList();
  func.children.blocks.getList().push(block);
  return block;
};
export const newInstruction = (block: Node, opcode: string): Node => {
  assert(block.type === "block");
  const inst = newNode(`instruction`);
  inst.children.opcode = newSymbol(opcode);
  block.children.instructions.getList().push(inst);
  return inst;
};
