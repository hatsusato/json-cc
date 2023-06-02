import assert from "assert";
import { CParser } from "../generated/scanner";
import {
  Module,
  type Id,
  type ModuleNode,
  type NodeValue,
  type Visitor,
} from "./module";
import { hexlify, isArray, isNonNull, isNull } from "./util";

interface LocType {
  first_line: number;
  last_line: number;
  first_column: number;
  last_column: number;
}

const ast = new Module();
export const parseAst = (input: string, source: string): Module => {
  const top = new CParser().parse(input);
  return ast.finish(top, source);
};

export const getName = class implements Visitor {
  list: string[] = [];
  apply({ type, token }: ModuleNode): string[] {
    if (type === "identifier") {
      assert(isNonNull(token));
      this.list.push(token);
      return [];
    }
    const key = this.getKey(type);
    return isNull(key) ? [] : [key];
  }

  getKey(type: string): string | null {
    return type === "declaration"
      ? "init_declarator_list"
      : type === "init_declarator_list" || type === "translation_unit"
      ? "list"
      : type === "init_declarator" ||
        type === "paren_direct_declarator" ||
        type === "function_definition"
      ? "declarator"
      : type === "declarator" ||
        type === "bracket_direct_declarator" ||
        type === "parameter_direct_declarator" ||
        type === "old_direct_declarator"
      ? "direct_declarator"
      : type === "identifier_direct_declarator"
      ? "identifier"
      : type === "external_declaration"
      ? "declaration"
      : null;
  }

  get result(): string {
    return this.list.join(", ");
  }
};

export const newAst = (type: string, value: NodeValue): Id => {
  return ast.push({ type, token: null, value });
};
export const newToken = (type: string, loc: LocType, token?: string): Id => {
  return ast.push({ type, token: token ?? type, value: {} });
};
const getList = (children: Id[]): Id[] => {
  if (children.length < 2) {
    return children;
  }
  const value = ast.at(children[0]).value;
  assert("list" in value && isArray(value.list));
  const last = children[children.length - 1];
  return [...value.list, last];
};
export const newList = (type: string, children: Id[]): Id => {
  assert(children.length < 4);
  const list = getList(children);
  return newAst(type, { list, children });
};
export const addOperator = (operator: string, id: Id): Id => {
  ast.at(id).setType(operator);
  return id;
};
export const isTypedef = (text: string): boolean => {
  return false;
};
export const yyerror = (text: string): void => {
  console.log("unknown token:", hexlify(text));
};
