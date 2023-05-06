import { calculate } from "./index";

test("calculate(2^32 / 1024)", () => {
  expect(calculate("2^32 / 1024")).toBe(4194304);
});
test("calculate(PI + (3! / 3)^20 / (1+1)^10 / 1024 - 1)", () => {
  expect(calculate("	PI + (3! / 3)^20 / (1+1)^10 / 1024 - 1")).toBe(Math.PI);
});
