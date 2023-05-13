import assert from "assert";
import { CParser } from "../generated/scanner";
import {
  hasKey,
  hexlify,
  isNotNull,
  isNull,
  isNumber,
  isString,
  last,
  valueMap,
  type Other,
} from "./util";

interface LocType {
  first_line: number;
  last_line: number;
  first_column: number;
  last_column: number;
}
type Id = number;
interface AstTokenValue {
  token: string;
}
interface AstListValue<T> {
  list: T[];
}
type AstObjectValue<T> = Record<string, T | null>;
interface AstElement<T> {
  type: string;
  loc: LocType | null;
  value: AstTokenValue | AstListValue<T> | AstObjectValue<T>;
  children: T[];
}
export interface AstNode extends AstElement<AstNode> {}

const parser = new CParser();
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
  construct(id: Id | null): AstNode | null {
    if (isNull(id)) {
      return null;
    }
    const node = root.get(id);
    const children = node.children.map(root.construct).filter(isNotNull);
    if (node.value === null || hasKey(node.value, "token")) {
      const value = node.value;
      return { ...node, value, children };
    } else if (hasKey(node.value, "list")) {
      const list = node.value.list.map(root.construct).filter(isNotNull);
      return { ...node, value: { list }, children };
    } else {
      const value = valueMap(node.value, root.construct);
      return { ...node, value, children };
    }
  },
  queryToken(node: AstElement<Id>): string {
    assert(hasKey(node.value, "token"));
    return node.value.token;
  },
  queryList(node: AstElement<Id>): Id[] {
    assert(hasKey(node.value, "list"));
    return node.value.list;
  },
  queryObject(node: AstElement<Id>, key: string): Id | null {
    assert(hasKey(node.value, key));
    return node.value[key];
  },
  getName(id: Id | null): string | null {
    if (isNull(id)) {
      return null;
    }
    const node = root.get(id);
    if (node.type === "identifier") {
      return root.queryToken(node);
    } else if (node.type === "declaration") {
      return root.getName(root.queryObject(node, "init_declarator_list"));
    } else if (
      node.type === "init_declarator_list" ||
      node.type === "translation_unit"
    ) {
      const list = root.queryList(node);
      return root.getName(list.length === 0 ? null : list[0]);
    } else if (
      node.type === "init_declarator" ||
      node.type === "paren_direct_declarator" ||
      node.type === "function_definition"
    ) {
      return root.getName(root.queryObject(node, "declarator"));
    } else if (
      node.type === "declarator" ||
      node.type === "bracket_direct_declarator" ||
      node.type === "parameter_direct_declarator" ||
      node.type === "old_direct_declarator"
    ) {
      return root.getName(root.queryObject(node, "direct_declarator"));
    } else if (node.type === "identifier_direct_declarator") {
      return root.getName(root.queryObject(node, "identifier"));
    } else if (node.type === "external_declaration") {
      return root.getName(root.queryObject(node, "declaration"));
    } else {
      return null;
    }
  },
};
export const parse = (
  input: string
): typeof root & { top: Id; get_top: () => AstNode | null } => {
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
  props: {
    type: string;
    loc?: LocType;
    children: Id[];
  } & Other
): Id => {
  const { type, loc, children, ...rest } = props;
  assert(
    Object.entries(rest).every(
      ([k, v]) => isString(k) && (isNull(v) || isNumber(v))
    )
  );
  const value = rest as Record<string, Id | null>;
  return root.push({ type, loc: loc ?? null, value, children });
};
export const newToken = (type: string, loc: LocType, token: string): Id => {
  return root.push({ type, loc, value: { token }, children: [] });
};
export const newList = (props: { type: string; children: Id[] }): Id => {
  const { type, children } = props;
  const getList = (id: Id): Id[] => {
    const value = root.get(id).value;
    assert(hasKey(value, "list"));
    return value.list;
  };
  const list =
    children.length < 2 ? children : [...getList(children[0]), last(children)];
  return root.push({ type, loc: null, value: { list }, children });
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
