import assert from "assert";
import { parse, type AstNode } from "./ast";
import { hasKey } from "./util";

const hasAstKey = <K extends string>(
  ast: AstNode,
  key: K
): ast is AstNode &
  ("list" extends K
    ? { value: { list: AstNode[] } }
    : "token" extends K
    ? { value: { token: string } }
    : { value: Record<K, AstNode> }) => hasKey(ast.value, key);

export const getName = (decl: AstNode): string | null => {
  if (decl.type === "declaration") {
    assert(hasAstKey(decl, "init_declarator_list"));
    return getName(decl.value.init_declarator_list);
  } else if (decl.type === "init_declarator_list") {
    assert(hasAstKey(decl, "list"));
    const list = decl.value.list.map(getName);
    return list.length === 0 ? null : list[0];
  } else if (decl.type === "init_declarator") {
    assert(hasAstKey(decl, "declarator"));
    return getName(decl.value.declarator);
  } else if (decl.type === "declarator") {
    assert(hasAstKey(decl, "direct_declarator"));
    return getName(decl.value.direct_declarator);
  } else if (decl.type === "identifier_direct_declarator") {
    assert(hasAstKey(decl, "identifier"));
    assert(hasAstKey(decl.value.identifier, "token"));
    return decl.value.identifier.value.token;
  } else if (decl.type === "paren_direct_declarator") {
    assert(hasAstKey(decl, "declarator"));
    return getName(decl.value.declarator);
  } else if (
    decl.type === "bracket_direct_declarator" ||
    decl.type === "parameter_direct_declarator" ||
    decl.type === "old_direct_declarator"
  ) {
    assert(hasAstKey(decl, "direct_declarator"));
    return getName(decl.value.direct_declarator);
  } else if (decl.type === "external_declaration") {
    assert(hasAstKey(decl, "declaration"));
    return getName(decl.value.declaration);
  } else if (decl.type === "function_definition") {
    assert(hasAstKey(decl, "declarator"));
    return getName(decl.value.declarator);
  } else {
    return null;
  }
};

export function run(input: string): void {
  const root = parse(input);
  const result = root.get_top();
  console.log(input.trim(), "=", result);
}
// run("int main(void) { return 0; }");
// run("int x; float y;");

console.log(process.argv);
