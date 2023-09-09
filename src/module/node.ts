import { assert } from "console";
import { Option, option } from "../util";
import { getPool } from "./pool";
import type { Id } from "./types";
import { expandNode } from "./visit";

export class Node {
  id: Id;
  type: string;
  symbol: Option<string> = option();
  list: Option<Node[]> = option();
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
    assert(this.type === "symbol" && this.symbol.ok);
    return this.symbol.unwrap();
  }
  getList(): Node[] {
    assert(this.type === "list" && this.list.ok);
    return this.list.unwrap();
  }
  getBlock(): Node {
    assert(this.type === "function");
    const block = this.children.blocks.getList().at(-1);
    return block ?? newBlock(this);
  }
}

export const newNode = (type: string) => getPool().createNode(type);
export const newSymbol = (symbol: string) => {
  const node = newNode("symbol");
  node.symbol = option(symbol);
  return node;
};
export const newList = () => {
  const node = newNode("list");
  node.list = option([]);
  return node;
};
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
  const inst = newNode(`inst.${opcode}`);
  block.children.instructions.getList().push(inst);
  return inst;
};
