import assert from "assert";
import { CParser } from "../generated/scanner";
import {
  Module,
  NodeValue,
  type Id,
  type NodeElem,
  type Visitor,
} from "./module";
import { hexlify, isArray } from "./util";

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

const getNameKey = {
  declaration: "init_declarator_list",
  init_declarator: "declarator",
  declarator: "direct_declarator",
  identifier_direct_declarator: "identifier",
  paren_direct_declarator: "declarator",
  bracket_direct_declarator: "direct_declarator",
  parameter_direct_declarator: "direct_declarator",
  old_direct_declarator: "direct_declarator",
  external_declaration: "declaration",
  function_definition: "declarator",
};
export const getName = class implements Visitor {
  list: string[] = [];
  apply({ type, token }: NodeElem): string[] | undefined {
    const nameList = { init_declarator_list: null, translation_unit: null };
    if (type === "identifier") {
      this.list.push(token);
      return [];
    } else if (type in nameList) {
      return ["list"];
    } else if (type in getNameKey) {
      return [getNameKey[type as keyof typeof getNameKey]];
    }
  }

  result(): string {
    return this.list.join(", ");
  }
};

export const getIdentifier = class implements Visitor {
  name?: NodeElem;
  apply(node: NodeElem, module: Module): string[] | undefined {
    const { type } = node;
    if (type === "identifier") {
      this.name = node;
      return [];
    } else if (type in getNameKey) {
      const key = getNameKey[type as keyof typeof getNameKey];
      return [key];
    } else {
      assert(false);
    }
  }
};

export const newAst = (type: string, value: NodeValue): Id => {
  value.children = undefined;
  return ast.push({ type, token: "", value });
};
export const newToken = (type: string, loc: LocType, token?: string): Id => {
  return ast.push({ type, token: token ?? "", value: {} });
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
  return newAst(type, { list });
};
export const addOperator = (operator: string, id: Id): Id => {
  ast.at(id).type = operator;
  return id;
};
export const isTypedef = (text: string): boolean => {
  return false;
};
export const yyerror = (text: string): void => {
  console.log("unknown token:", hexlify(text));
};
