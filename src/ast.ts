import { CParser } from "../generated/scanner";
import assert from "assert";
import {
  hasKey,
  hexlify,
  isArray,
  isNull,
  isNumber,
  last,
  valueMap,
  Other,
  PartialPick,
} from "./util";

type Id = number;
type LocType = {
  first_line: number;
  last_line: number;
  first_column: number;
  last_column: number;
};
type AstElement<T> = {
  type: string;
  loc: LocType | null;
  value: object | null;
  children: T[];
};
interface AstNode extends AstElement<AstNode> {}

const parser = new CParser();
const root = {
  list: [] as AstElement<Id>[],
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
    const value = isNull(node.value)
      ? null
      : valueMap(node.value, (value: unknown) =>
          isNumber(value) ? root.construct(value) : value
        );
    const children = node.children.map(root.construct);
    return { ...node, value, children };
  },
};
export const parse = (input: string) => {
  const top: Id = parser.parse(input);
  return {
    ...root,
    top,
    get_top() {
      return this.construct(top);
    },
  };
};

export const new_ast = (
  props: PartialPick<AstElement<Id>, "loc" | "value"> & Other
): Id => {
  const { type, loc, children, ...value } = props;
  return root.push({ type, loc: loc ?? null, value, children });
};
export const new_token = (type: string, loc: LocType, token: string): Id => {
  return new_ast({ type, loc, token, children: [] });
};
export const new_list = (props: { type: string; children: Id[] }): Id => {
  const { type, children } = props;
  const get_list = (id: Id) => {
    const value = root.get(id).value;
    assert(hasKey(value, "list") && isArray(value.list));
    return value.list;
  };
  const list =
    children.length < 2 ? children : [...get_list(children[0]), last(children)];
  return new_ast({ type, list, children });
};
export const add_operator = (operator: string, id: number) => {
  const node = root.get(id);
  assert(hasKey(node.value, "operator"));
  node.value.operator = operator;
  return id;
};
export const is_typedef = (text: string) => {
  return false;
};
export const yyerror = (text: string) => {
  console.log("unknown token:", hexlify(text));
};
