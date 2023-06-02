import { getName, parseAst } from "./ast";

test("main", () => {
  const src = "int main(void) { return a + 1.2; }";
  const ast = parseAst(src, "main.c");
  const name = getName(ast);
  expect(name).toStrictEqual("main");
});
test("decl", () => {
  const src = "int x = 3; int y = 4;";
  const ast = parseAst(src, "decl.c");
  const name = getName(ast);
  expect(name).toStrictEqual("x, y");
});
