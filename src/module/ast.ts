import assert from "assert";
import { Module } from "./module";
import type { Value } from "./types";
import { Option, isArray, isObject, isString, objMap, option } from "./util";

class AstVisitor {
  module: Module;
  null: Option<Value> = option();
  constructor(module: Module) {
    this.module = module;
  }
  create(type: string): Value {
    return this.module.createValue(type);
  }
  getNull(): Value {
    if (!this.null.ok) {
      const value = this.create("null");
      this.null = option(value);
    }
    return this.null.value;
  }
  visit(key: string, ast: unknown): Value {
    if (ast === null) {
      return this.getNull();
    } else if (isArray(ast)) {
      const value = this.create(key);
      const list = ast.map((x) => this.visit(key, x));
      value.list = list;
      return value;
    } else if (isObject(ast)) {
      if ("symbol" in ast) {
        assert(isString(ast.symbol));
        const value = this.create(key);
        value.symbol = ast.symbol;
        return value;
      } else if ("type" in ast) {
        assert(isString(ast.type));
        const { type, ...children } = ast;
        const value = this.create(type);
        value.children = objMap(children, ([k, v]) => this.visit(k, v));
        return value;
      }
    }
    assert(false);
  }
}
export const convert = (ast: unknown): Module => {
  const module = new Module();
  const visitor = new AstVisitor(module);
  const value = visitor.visit("ast", ast);
  module.setTop(value);
  return module;
};
