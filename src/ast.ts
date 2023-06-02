import assert from "assert";
import { CParser } from "../generated/scanner";
import {
  Module,
  type Id,
  type IdValue,
  type ModuleNode,
  type NodeValue,
} from "./module";
import { hexlify, isArray, isNonNull, isNull } from "./util";

interface LocType {
  first_line: number;
  last_line: number;
  first_column: number;
  last_column: number;
}

class Ast {
  module: Module = new Module([]);
  locations: Array<LocType | null> = [];

  private push(
    elem: { type: string; token: string | null; value: NodeValue },
    loc?: LocType
  ): Id {
    const id = this.module.push(elem);
    this.locations.push(loc ?? null);
    return id;
  }

  finish(top: Id, source: string): Module {
    return this.module.finish(top, source);
  }

  pushAst(type: string, value: NodeValue): Id {
    return this.push({ type, token: null, value });
  }

  pushToken(type: string, loc: LocType, token?: string): Id {
    return this.push({ type, token: token ?? type, value: {} }, loc);
  }

  pushList(type: string, children: Id[]): Id {
    assert(children.length < 4);
    const list = this.getList(children);
    return this.pushAst(type, { list, children });
  }

  private getList(children: Id[]): Id[] {
    if (children.length < 2) {
      return children;
    }
    const value = this.module.at(children[0]).value;
    assert("list" in value && isArray(value.list));
    const last = children[children.length - 1];
    return [...value.list, last];
  }
}

const ast = new Ast();
export const parseAst = (input: string, source: string): Module => {
  const top = new CParser().parse(input);
  return ast.finish(top, source);
};

export const getName = (module: Module, id: Id): string => {
  const list: string[] = [];
  const visitor = (node: ModuleNode): string[] => {
    const type = node.type;
    if (type === "identifier") {
      assert(isNonNull(node.token));
      list.push(node.token);
    }
    const next =
      type === "declaration"
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
    return isNull(next) ? [] : [next];
  };
  module.visit(visitor);
  return list.join(", ");
};

export const newAst = (type: string, value: Record<string, IdValue>): Id => {
  return ast.pushAst(type, value);
};
export const newToken = (type: string, loc: LocType, token?: string): Id => {
  return ast.pushToken(type, loc, token);
};
export const newList = (type: string, children: Id[]): Id => {
  return ast.pushList(type, children);
};
export const addOperator = (operator: string, id: Id): Id => {
  ast.module.at(id).setType(operator);
  return id;
};
export const isTypedef = (text: string): boolean => {
  return false;
};
export const yyerror = (text: string): void => {
  console.log("unknown token:", hexlify(text));
};
