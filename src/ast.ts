import assert from "assert";
import { CParser } from "../generated/scanner";
import {
  hasKey,
  hexlify,
  isArray,
  isObject,
  last,
  valueMap,
  type Other,
  type PartialPick,
} from "./util";

type Id = number;
interface LocType {
  first_line: number;
  last_line: number;
  first_column: number;
  last_column: number;
}
interface AstElement<T> {
  type: string;
  loc: LocType | null;
  value: object | null;
  children: T[];
}
export interface AstNode extends AstElement<AstNode> {}

const parser = new CParser();
const hasAstKey = <T, K extends string>(
  ast: AstElement<T>,
  key: K
): ast is AstElement<T> &
  ("list" extends K
    ? { value: { list: T[] } }
    : "token" extends K
    ? { value: { token: string } }
    : { value: Record<K, T> }) => hasKey(ast.value, key);

const root = {
  list: [] as Array<AstElement<Id>>,
  get(id: Id): AstElement<Id> {
    return root.list[id];
  },
  push(e: AstElement<Id>): Id {
    const id = root.list.length;
    root.list.push(e);
    return id;
  },
  construct(id: number): AstNode {
    const node = root.get(id);
    const constructValue = (value: unknown): unknown => {
      if (isArray(value)) {
        return value.map(constructValue);
      }
      if (isObject(value)) return valueMap(value, constructValue);
      return value;
    };
    const value = constructValue(node.value) as typeof node.value;
    const children = node.children.map(root.construct);
    return { ...node, value, children };
  },
  getName(id: number): string | null {
    const node = root.get(id);
    if (node.type === "identifier") {
      assert(hasAstKey(node, "token"));
      return node.value.token;
    } else if (node.type === "declaration") {
      assert(hasAstKey(node, "init_declarator_list"));
      return root.getName(node.value.init_declarator_list);
    } else if (
      node.type === "init_declarator_list" ||
      node.type === "translation_unit"
    ) {
      assert(hasAstKey(node, "list"));
      const list = node.value.list.map(root.getName);
      return list.length === 0 ? null : list[0];
    } else if (
      node.type === "init_declarator" ||
      node.type === "paren_direct_declarator" ||
      node.type === "function_definition"
    ) {
      assert(hasAstKey(node, "declarator"));
      return root.getName(node.value.declarator);
    } else if (
      node.type === "declarator" ||
      node.type === "bracket_direct_declarator" ||
      node.type === "parameter_direct_declarator" ||
      node.type === "old_direct_declarator"
    ) {
      assert(hasAstKey(node, "direct_declarator"));
      return root.getName(node.value.direct_declarator);
    } else if (node.type === "identifier_direct_declarator") {
      assert(hasAstKey(node, "identifier"));
      return root.getName(node.value.identifier);
    } else if (node.type === "external_declaration") {
      assert(hasAstKey(node, "declaration"));
      return root.getName(node.value.declaration);
    } else {
      return null;
    }
  },
};
export const parse = (
  input: string
): typeof root & { top: Id; get_top: () => AstNode } => {
  const top: Id = parser.parse(input);
  return {
    ...root,
    top,
    get_top() {
      return this.construct(top);
    },
  };
};

export const newAst = (
  props: PartialPick<AstElement<Id>, "loc" | "value"> & Other
): Id => {
  const { type, loc, children, ...value } = props;
  return root.push({ type, loc: loc ?? null, value, children });
};
export const newToken = (type: string, loc: LocType, token: string): Id => {
  return newAst({ type, loc, token, children: [] });
};
export const newList = (props: { type: string; children: Id[] }): Id => {
  const { type, children } = props;
  const getList = (id: Id): unknown[] => {
    const value = root.get(id).value;
    assert(hasKey(value, "list") && isArray(value.list));
    return value.list;
  };
  const list =
    children.length < 2 ? children : [...getList(children[0]), last(children)];
  return newAst({ type, list, children });
};
export const addOperator = (operator: string, id: Id): Id => {
  const node = root.get(id);
  assert(hasKey(node.value, "operator"));
  node.value.operator = operator;
  return id;
};
export const isTypedef = (text: string): boolean => {
  return false;
};
export const yyerror = (text: string): void => {
  console.log("unknown token:", hexlify(text));
};
