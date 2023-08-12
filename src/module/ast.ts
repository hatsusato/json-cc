import assert from "assert";
import { Module } from "./module";
import { type Id, type Option, type Value } from "./types";
import { isArray, isObject, isString, objMap, option } from "./util";

class AstVisitor {
  module: Module;
  null: Option<Id> = option();
  constructor(module: Module) {
    this.module = module;
  }
  create(type: string): Value {
    return this.module.createValue(type);
  }
  getNull(): Id {
    if (!this.null.ok) {
      const value = this.create("null");
      this.null = option(value.id);
    }
    return this.null.value;
  }
  visit(key: string, ast: unknown): Option<Id> {
    if (ast === null) {
      return option(this.getNull());
    } else if (isArray(ast)) {
      const value = this.create(key);
      const list = ast.map((x) => this.visit(key, x));
      assert(list.every((x) => x.ok));
      value.list = list.map((x) => x.value);
      return option(value.id);
    } else if (isObject(ast)) {
      if ("symbol" in ast) {
        assert(isString(ast.symbol));
        const value = this.create(key);
        value.symbol = ast.symbol;
        return option(value.id);
      } else if ("type" in ast) {
        assert(isString(ast.type));
        const { type, ...children } = ast;
        const value = this.create(type);
        value.children = objMap(children, ([k, v]) => this.visit(k, v));
        return option(value.id);
      }
    }
    assert(false);
  }
}
export const convert = (ast: unknown): Module => {
  const module = new Module();
  const visitor = new AstVisitor(module);
  const id = visitor.visit("ast", ast);
  assert(id.value === 0);
  module.setTop(0);
  return module;
};
