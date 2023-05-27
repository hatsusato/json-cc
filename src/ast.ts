import assert from "assert";
import { CParser } from "../generated/scanner";
import {
  hexlify,
  isArray,
  isDefined,
  isNumber,
  isNumberArray,
  isUndefined,
  smartMap,
} from "./util";

interface LocType {
  first_line: number;
  last_line: number;
  first_column: number;
  last_column: number;
}
type Id = number;
type AstValue<T> = T | T[] | null;
interface AstElement<T> {
  type: string;
  token: string | null;
  value: Record<string, AstValue<T>>;
}
export interface AstNode extends AstElement<AstNode> {}

interface AstModule {
  elements: Array<AstElement<Id>>;
  locations: Array<LocType | null>;
  top: number;
  get: (id: Id) => AstElement<Id>;
  push: (elem: AstElement<Id>, loc?: LocType) => Id;
  construct: (id: Id) => AstNode;
  get_top: () => AstNode;
  query: (
    id: AstElement<Id>,
    keyMap: (key: string) => string | undefined
  ) => AstValue<Id> | undefined;
  getName: (id: Id) => string;
}

const root: AstModule = {
  elements: [],
  locations: [],
  top: undefined as unknown as number,
  get(id: Id): AstElement<Id> {
    assert(id < root.elements.length);
    return root.elements[id];
  },
  push(elem: AstElement<Id>, loc?: LocType): Id {
    const id = root.elements.length;
    root.elements.push(elem);
    root.locations.push(loc ?? null);
    return id;
  },
  construct(id: Id): AstNode {
    const elem = root.get(id);
    const f = (id: AstValue<Id>): AstValue<AstNode> =>
      isNumber(id)
        ? root.construct(id)
        : isNumberArray(id)
        ? id.map(root.construct).filter(isDefined)
        : null;
    return { ...elem, value: smartMap(elem.value, f) };
  },
  get_top(): AstNode {
    assert(isNumber(root.top));
    return root.construct(root.top);
  },
  query(
    elem: AstElement<Id>,
    keyMap: (key: string) => string | undefined
  ): AstValue<Id> | undefined {
    const key = keyMap(elem.type);
    if (!isUndefined(key) && key in elem.value) {
      const result = elem.value[key];
      if (key === "children" || key === "list") {
        assert(isArray(result));
      }
      return result;
    }
    return undefined;
  },
  getName(id: Id): string {
    const elem = root.get(id);
    if (elem.type === "identifier") {
      return elem.token ?? "";
    } else {
      const keyMap = (type: string): string | undefined =>
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
          : undefined;
      const value = root.query(elem, keyMap);
      const list = isArray(value) ? value : isNumber(value) ? [value] : [];
      return list.map(root.getName).join(", ");
    }
  },
};

export const parse = (input: string): AstModule => {
  const parser = new CParser();
  root.top = parser.parse(input);
  return root;
};

export const newAst = (
  type: string,
  value: Record<string, AstValue<Id>>
): Id => {
  return root.push({ type, token: null, value });
};
export const newToken = (type: string, loc: LocType, token?: string): Id => {
  return root.push({ type, token: token ?? type, value: {} }, loc);
};
export const newList = (type: string, children: Id[]): Id => {
  const getList = (id: Id): Id[] => {
    const value = root.get(id).value;
    assert("list" in value && isArray(value.list));
    return value.list;
  };
  assert(children.length < 4);
  const list =
    children.length < 2
      ? children
      : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        [...getList(children[0]), children.at(-1)!];
  return root.push({ type, token: null, value: { list, children } });
};
export const addOperator = (operator: string, id: Id): Id => {
  const node = root.get(id);
  node.type = operator;
  return id;
};
export const isTypedef = (text: string): boolean => {
  return false;
};
export const yyerror = (text: string): void => {
  console.log("unknown token:", hexlify(text));
};
