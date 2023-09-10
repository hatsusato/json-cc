import assert from "assert";
import { asString, isArray, isObject, objMap } from "../util";
import { newList, newSymbol } from "./node";
import { getNull, getPool } from "./pool";
import type { Node } from "./types";

class AstVisitor {
  constructor() {
    const pool = getPool();
  }
  visit(key: string, ast: unknown): Node {
    if (ast === null) {
      return getNull();
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
      node.children.list = newList(ast.map((x) => this.visit(key, x)));
    } else if ("symbol" in ast) {
      node.children.symbol = newSymbol(asString(ast.symbol));
    } else if ("type" in ast) {
      const { type: _, ...children } = ast;
      node.children = objMap(children, ([k, v]) => this.visit(k, v));
    }
    return node;
  }
}
export const convert = (ast: unknown): Node => {
  const visitor = new AstVisitor();
  const top = visitor.visit("top", ast);
  return top.children.translation_unit;
};
