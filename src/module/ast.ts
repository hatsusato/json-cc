import assert from "assert";
import { asString, isArray, isObject, objMap, option } from "../util";
import { getPool } from "./pool";
import type { Node } from "./types";

class AstVisitor {
  null: Node;
  constructor() {
    const pool = getPool();
    this.null = pool.createNode("null");
  }
  visit(key: string, ast: unknown): Node {
    if (ast === null) {
      return this.null;
    } else {
      assert(
        isArray(ast) || (isObject(ast) && ("symbol" in ast || "type" in ast))
      );
      if ("type" in ast) {
        key = asString(ast.type);
      }
    }
    const node = getPool().createNode(key);
    if (isArray(ast)) {
      node.list = option(ast.map((x) => this.visit(key, x)));
    } else if ("symbol" in ast) {
      node.symbol = option(asString(ast.symbol));
    } else if ("type" in ast) {
      const { type: _, ...children } = ast;
      node.children = objMap(children, ([k, v]) => this.visit(k, v));
    }
    return node;
  }
}
export const convert = (ast: unknown) => {
  const visitor = new AstVisitor();
  const { translation_unit } = visitor.visit("top", ast).children;
  const top = getPool().getTop();
  top.type = translation_unit.type;
  top.list = translation_unit.list;
};
