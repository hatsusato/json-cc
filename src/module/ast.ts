import assert from "assert";
import { Module } from "./module";
import { Id } from "./type";
import { Value } from "./value";

const asString = (x: unknown): string => {
  assert(typeof x === "string");
  return x;
};
const isNonNull = <T>(x: T | null): x is T => x !== null;
const isObject = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null;

class AstVisitor {
  module: Module;
  constructor(module: Module) {
    this.module = module;
  }
  create(type: string): Value {
    return this.module.createValue(type);
  }
  visit(key: string, ast: unknown): Id | null {
    if (Array.isArray(ast)) {
      const value = this.create(key);
      value.list = ast.map((x) => this.visit(key, x)).filter(isNonNull);
      return value.id;
    } else if (isObject(ast) && "symbol" in ast) {
      const value = this.create(key);
      value.symbol = asString(ast.symbol);
      return value.id;
    } else if (isObject(ast) && "type" in ast) {
      const { type, ...children } = ast;
      const value = this.create(asString(type));
      value.children = Object.entries(children)
        .map(([k, v]) => ({ [k]: this.visit(k, v) }))
        .reduce((prev, next) => ({ ...prev, ...next }), {});
      return value.id;
    } else {
      assert(ast === null);
      return null;
    }
  }
}
export const convert = (top: unknown): Module => {
  const module = new Module();
  const visitor = new AstVisitor(module);
  const id = visitor.visit("top", top);
  assert(id === 0);
  return module;
};
