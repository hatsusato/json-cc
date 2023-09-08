import assert from "assert";
import { Option, asString, isArray, isObject, objMap, option } from "../util";
import type { Value, ValuePool } from "./types";

class AstVisitor {
  pool: ValuePool;
  null: Option<Value> = option();
  constructor(pool: ValuePool) {
    this.pool = pool;
  }
  create(type: string): Value {
    return this.pool.createValue(type);
  }
  getNull(): Value {
    if (!this.null.ok) {
      const value = this.create("null");
      this.null = option(value);
    }
    return this.null.unwrap();
  }
  visit(key: string, ast: unknown): Value {
    if (ast === null) {
      return this.getNull();
    } else {
      assert(
        isArray(ast) || (isObject(ast) && ("symbol" in ast || "type" in ast))
      );
      if ("type" in ast) {
        key = asString(ast.type);
      }
    }
    const value = this.create(key);
    if (isArray(ast)) {
      value.list = option(ast.map((x) => this.visit(key, x)));
    } else if ("symbol" in ast) {
      value.symbol = option(asString(ast.symbol));
    } else if ("type" in ast) {
      const { type: _, ...children } = ast;
      value.children = objMap(children, ([k, v]) => this.visit(k, v));
    }
    return value;
  }
}
export const convert = (pool: ValuePool, ast: unknown): Value => {
  const visitor = new AstVisitor(pool);
  const value = visitor.visit("top", ast);
  value.type = "top";
  return value;
};
