import assert from "assert";
import { CParser } from "../generated/scanner";
import {
  hasKey,
  hexlify,
  isNotUndefined,
  isNull,
  isUndefined,
  last,
  valueMap,
} from "./util";

interface LocType {
  first_line: number;
  last_line: number;
  first_column: number;
  last_column: number;
}
type Id = number;
type AstTokenValue<T> = {
  token: string;
} & { children: T[] };
type AstListValue<T> = {
  list: T[];
} & { children: T[] };
type AstObjectKeys =
  | "expression"
  | "postfix_expression"
  | "argument_expression_list"
  | "identifier"
  | "unary_expression"
  | "unary_operator"
  | "cast_expression"
  | "type_name"
  | "left"
  | "right"
  | "condition"
  | "assignment_operator"
  | "declaration_specifiers"
  | "init_declarator_list"
  | "storage_class_specifier"
  | "type_specifier"
  | "type_qualifier"
  | "declarator"
  | "initializer"
  | "struct_or_union"
  | "struct_declaration_list"
  | "struct"
  | "union"
  | "specifier_qualifier_list"
  | "struct_declarator_list"
  | "constant_expression"
  | "enumerator_list"
  | "enumeration_constant"
  | "pointer"
  | "direct_declarator"
  | "parameter_type_list"
  | "identifier_list"
  | "type_qualifier_list"
  | "parameter_list"
  | "abstract_declarator"
  | "direct_abstract_declarator"
  | "typedef_identifier"
  | "initializer_list"
  | "labeled_statement"
  | "compound_statement"
  | "expression_statement"
  | "selection_statement"
  | "iteration_statement"
  | "jump_statement"
  | "statement"
  | "declaration_list"
  | "statement_list"
  | "then"
  | "else"
  | "expression1"
  | "expression2"
  | "expression3"
  | "declaration";
type AstObjectValue<T> = Partial<Record<AstObjectKeys, T | null>> & {
  children: T[];
};
interface AstElement<T> {
  type: string;
  value: AstTokenValue<T> | AstListValue<T> | AstObjectValue<T>;
}
export interface AstNode extends AstElement<AstNode> {}

function query(node: AstElement<Id>, key: "token"): string | undefined;
function query(
  node: AstElement<Id>,
  key: "list" | "children"
): Id[] | undefined;
function query(node: AstElement<Id>, key: AstObjectKeys): Id | null | undefined;
function query(
  node: AstElement<Id>,
  key: "children" | "token" | "list" | AstObjectKeys
): string | Id[] | Id | null | undefined {
  const value = node.value;
  if (key === "children") {
    return value[key];
  } else if (key === "token" || hasKey(value, "token")) {
    if (key === "token" && hasKey(value, "token")) {
      return value[key];
    }
  } else if (key === "list" || hasKey(value, "list")) {
    if (key === "list" && hasKey(value, "list")) {
      return value[key];
    }
  } else if (hasKey(value, key)) {
    return value[key];
  }
  return undefined;
}

const parser = new CParser();
const root = {
  list: [] as Array<AstElement<Id>>,
  locations: [] as Array<LocType | null>,
  top: undefined,
  get(id: Id): AstElement<Id> {
    return this.list[id];
  },
  push(e: AstElement<Id>, loc?: LocType): Id {
    const id = this.list.length;
    this.list.push(e);
    this.locations.push(loc ?? null);
    return id;
  },
  construct(id: Id): AstNode | undefined {
    const node = this.get(id);
    const value = node.value;
    const children = value.children.map(this.construct).filter(isNotUndefined);
    if (hasKey(value, "token")) {
      const token = value.token;
      return { ...node, value: { token, children } };
    } else if (hasKey(value, "list")) {
      const list = value.list.map(this.construct).filter(isNotUndefined);
      return { ...node, value: { list, children } };
    } else {
      const { children: _, ...rest } = value;
      const values = valueMap(rest, (id) =>
        isNull(id) ? null : this.construct(id)
      );
      return { ...node, value: { ...values, children } };
    }
  },
  get_top(): AstNode | undefined {
    return isUndefined(this.top) ? undefined : this.construct(this.top);
  },
  query,
  getName(id?: Id): string | undefined {
    if (id === undefined) {
      return undefined;
    }
    const node = this.get(id);
    const queryName = <K extends AstObjectKeys>(
      key: K | "list" | "token"
    ): string | undefined => {
      if (key === "token") {
        return this.query(node, "token");
      } else if (key === "list") {
        const list = this.query(node, "list") ?? [];
        return list.length === 0 ? undefined : this.getName(list[0]);
      } else {
        const id = this.query(node, key) ?? undefined;
        return isUndefined(id) ? undefined : this.getName(id);
      }
    };
    if (node.type === "identifier") {
      return this.query(node, "token");
    } else if (node.type === "declaration") {
      return queryName("init_declarator_list");
    } else if (
      node.type === "init_declarator_list" ||
      node.type === "translation_unit"
    ) {
      return queryName("list");
    } else if (
      node.type === "init_declarator" ||
      node.type === "paren_direct_declarator" ||
      node.type === "function_definition"
    ) {
      return queryName("declarator");
    } else if (
      node.type === "declarator" ||
      node.type === "bracket_direct_declarator" ||
      node.type === "parameter_direct_declarator" ||
      node.type === "old_direct_declarator"
    ) {
      return queryName("direct_declarator");
    } else if (node.type === "identifier_direct_declarator") {
      return queryName("identifier");
    } else if (node.type === "external_declaration") {
      return queryName("declaration");
    } else {
      return undefined;
    }
  },
};
export const parse = (input: string): typeof root => {
  root.top = parser.parse(input);
  return root;
};

export const newAst = (props: { type: string } & AstObjectValue<Id>): Id => {
  const { type, ...value } = props;
  return root.push({ type, value });
};
export const newToken = (type: string, loc: LocType, token: string): Id => {
  return root.push({ type, value: { token, children: [] } }, loc);
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
  return root.push({ type, value: { list, children } });
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
