import Scanner = require("../generated/scanner");

const parser = new Scanner.CParser();
type ParseElement<K extends string, A extends number> = {
  type: string;
  kind: K;
  age: A;
  id: number;
  children: number[];
};
type AstElement = ParseElement<"ast", 0>;
type RawAstType = {
  type: string;
  children: RawAstType[];
  [key: string]: any;
};
type ParseResult = {
  root: AstElement[];
  top: number;
  construct: (id: number) => RawAstType;
  get_top: () => RawAstType;
};

export function parse(input: string): ParseResult {
  const ast: RawAstType = parser.parse(input);
  const root: AstElement[] = [];
  const f = (node: RawAstType): number => {
    const children = node.children.map((child) => f(child));
    const id = root.length;
    root.push({ ...node, kind: "ast", age: 0, id, children });
    return id;
  };
  const top = f(ast);
  const result: ParseResult = {
    root,
    top,
    construct(id: number) {
      const ast = this.root[id];
      return { ...ast, children: ast.children.map((id) => this.construct(id)) };
    },
    get_top() {
      return this.construct(this.top);
    },
  };
  return result;
}
export const get_name = (decl: any): string | null => {
  if (decl.type === "declaration") {
    return get_name(decl.init_declarator_list);
  } else if (decl.type === "init_declarator_list") {
    const list = decl.list.map(get_name);
    return list.length === 1 ? list[0] : list;
  } else if (decl.type === "init_declarator") {
    return get_name(decl.declarator);
  } else if (decl.type === "declarator") {
    return get_name(decl.direct_declarator);
  } else if (decl.type === "identifier_direct_declarator") {
    return decl.identifier.value;
  } else if (decl.type === "paren_direct_declarator") {
    return get_name(decl.declarator);
  } else if (
    decl.type === "bracket_direct_declarator" ||
    decl.type === "parameter_direct_declarator" ||
    decl.type === "old_direct_declarator"
  ) {
    return get_name(decl.direct_declarator);
  } else if (decl.type === "external_declaration") {
    return get_name(decl.declaration);
  } else if (decl.type === "function_definition") {
    return get_name(decl.declarator);
  } else {
    return null;
  }
};

function run(input: string) {
  const result = parse(input).get_top();
  console.log(input.trim(), "=", result);
}
run("int main(void) { return 0; }");
run("int x; float y;");
