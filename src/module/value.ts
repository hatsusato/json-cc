import { assert } from "console";
import { Option, option } from "../util";
import { getPool } from "./pool";
import type { Id } from "./types";
import { expandValue } from "./visit";

export class Value {
  id: Id;
  type: string;
  symbol: Option<string> = option();
  list: Option<Value[]> = option();
  children: Record<string, Value> = {};
  constructor(id: Id, type: string) {
    this.id = id;
    this.type = type;
  }
  show(): string {
    return JSON.stringify(this.showObject(), undefined, 2);
  }
  showObject(): object {
    return expandValue(this);
  }
  getSymbol(): string {
    assert(this.type === "symbol" && this.symbol.ok);
    return this.symbol.unwrap();
  }
  getList(): Value[] {
    assert(this.type === "list" && this.list.ok);
    return this.list.unwrap();
  }
  getBlock(): Value {
    assert(this.type === "function");
    const block = this.children.blocks.getList().at(-1);
    return block ?? newBlock(this);
  }
}

export const newValue = (type: string) => getPool().createValue(type);
export const newSymbol = (symbol: string) => {
  const value = newValue("symbol");
  value.symbol = option(symbol);
  return value;
};
export const newList = () => {
  const value = newValue("list");
  value.list = option([]);
  return value;
};
export const newModule = (source_filename: string): Value => {
  const module = newValue("module");
  const datalayout =
    "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-f80:128-n8:16:32:64-S128";
  const triple = "x86_64-unknown-linux-gnu";
  module.children.source_filename = newSymbol(source_filename);
  module.children.datalayout = newSymbol(datalayout);
  module.children.triple = newSymbol(triple);
  module.children.functions = newList();
  return module;
};
export const newFunction = (module: Value): Value => {
  assert(module.type === "module");
  const func = newValue("function");
  func.children.blocks = newList();
  module.children.functions.getList().push(func);
  return func;
};
export const newBlock = (func: Value): Value => {
  assert(func.type === "function");
  const block = newValue("block");
  block.children.instructions = newList();
  func.children.blocks.getList().push(block);
  return block;
};
export const newInstruction = (block: Value, opcode: string): Value => {
  assert(block.type === "block");
  const inst = newValue(`inst.${opcode}`);
  block.children.instructions.getList().push(inst);
  return inst;
};
