import { parse } from "./ast";

export function run(input: string): void {
  const root = parse(input);
  const result = root.get_top();
  console.log(input.trim(), "=", result);
}
run("int main(void) { return 0; }");
run("int x; float y;");

console.log(process.argv);
