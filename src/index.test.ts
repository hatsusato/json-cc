import { parse, get_name } from "./index";

test("main", () => {
  const src = "int main(void) { return a + 1.2; }";
  const ast = parse(src).get_top();
  const name = get_name(ast.list[0]);
  expect(name).toStrictEqual("main");
});
test("decl", () => {
  const src = "int x = 3;";
  const ast = parse(src).get_top();
  const name = get_name(ast.list[0]);
  expect(name).toStrictEqual("x");
});
