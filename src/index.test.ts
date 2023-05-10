import assert from "assert";
import { parse, type AstNode } from "./ast";
import { getName } from "./index";
import { hasKey, isArray } from "./util";

const isList = (
  ast: AstNode
): ast is AstNode & { value: { list: AstNode[] } } => {
  return hasKey(ast.value, "list") && isArray(ast.value.list);
};

test("main", () => {
  const src = "int main(void) { return a + 1.2; }";
  const ast = parse(src).get_top();
  assert(hasKey(ast.value, "list") && isArray(ast.value.list));
  assert(isList(ast));
  const name = getName(ast.value.list[0]);
  expect(name).toStrictEqual("main");
});
test("decl", () => {
  const src = "int x = 3;";
  const ast = parse(src).get_top();
  assert(isList(ast));
  console.log(JSON.stringify(ast.value.list[0]));
  // const name = getName(ast.value.list[0])
  expect(ast).toStrictEqual("x");
});
