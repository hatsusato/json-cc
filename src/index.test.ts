import { parse } from "./ast";

test("main", () => {
  const src = "int main(void) { return a + 1.2; }";
  const root = parse(src);
  const name = root.getName(root.top);
  expect(name).toStrictEqual("main");
});
test("decl", () => {
  const src = "int x = 3; int y = 4;";
  const root = parse(src);
  const name = root.getName(root.top);
  expect(name).toStrictEqual("x, y");
});
