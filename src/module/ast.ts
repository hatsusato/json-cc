import assert from "assert";
import { isArray, isObject, isString, objMap } from "../util";
import { newList, newSymbol } from "./node";
import { getNull, getPool } from "./pool";
import type { Node } from "./types";

const isValidAst = (
  ast: unknown
): ast is null | unknown[] | { symbol: string } | { type: string } =>
  ast === null ||
  isArray(ast) ||
  (isObject(ast) && "symbol" in ast && isString(ast.symbol)) ||
  (isObject(ast) && "type" in ast && isString(ast.type));
const visit = (key: string, ast: unknown): Node => {
  assert(isValidAst(ast));
  if (ast === null) {
    return getNull();
  } else if ("type" in ast) {
    key = ast.type;
  }
  const node = getPool().createNode(key);
  if (isArray(ast)) {
    node.children.list = newList(ast.map((x) => visit(key, x)));
  } else if ("symbol" in ast) {
    node.children.symbol = newSymbol(ast.symbol);
  } else if ("type" in ast) {
    const { type: _, ...children } = ast;
    node.children = objMap(children, ([k, v]) => visit(k, v));
  }
  return node;
};
export const convert = (ast: unknown): Node => {
  const top = visit("top", ast);
  return top.children.translation_unit;
};
