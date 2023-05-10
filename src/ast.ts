import { CParser } from "../generated/scanner";
import assert from "assert";

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
type Other = Record<string, unknown>;

const parser = new CParser();
const isNull = (x: unknown): x is null => x === null;
const isNumber = (x: unknown): x is number => typeof x === "number";
const isArray = (x: unknown): x is unknown[] => Array.isArray(x);
const isObject = (x: unknown): x is object =>
  !isNull(x) && !isArray(x) && typeof x === "object";
const hasKey = <K extends string>(
  x: object | null,
  key: K
): x is Record<K, unknown> => isObject(x) && key in x;
const last = (x: unknown[]) => x[x.length - 1];
const valueMap = (value: object, f: (value: unknown) => unknown): object =>
  Object.entries(value)
    .map(([key, value]) => ({ [key]: f(value) }))
    .reduce((prev, next) => ({ ...prev, ...next }), {});

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

export const new_ast = (
  props: { type: string; loc?: LocType; children: Id[] } & Other
): Id => {
  const { type, loc, children, ...value } = props;
  return root.push({ type, loc: loc ?? null, value, children });
};
export const new_token = (type: string, loc: LocType, value?: unknown): Id => {
  return new_ast({ type, loc, value: value ?? null, children: [] });
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
  return new_ast({ type, children, list });
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
export const hexlify = (str: string): string => {
  return str
    .split("")
    .map((ch) => "0x" + ch.charCodeAt(0).toString(16))
    .join(", ");
};
