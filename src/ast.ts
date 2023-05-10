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
