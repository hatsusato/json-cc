import { parse } from "./index";

test("main", () => {
  const src = "int main(void) { return a + 1.2; }";
  expect(parse(src)).toStrictEqual({
    result: true,
  });
});
test("decl", () => {
  const src = "int x = 3;";
  expect(parse(src)).toStrictEqual({ result: true });
});
