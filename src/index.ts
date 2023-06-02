import { readFileSync } from "fs";
import { getName, parseAst } from "./ast";
import { type Module } from "./module";

export const compile = (module: Module): string => {
  const name = module.visit(getName).result;
  return [
    ...module.emitHeader(),
    `define dso_local i32 @${name}() {`,
    "  %1 = alloca i32, align 4",
    "  store i32 0, i32* %1, align 4",
    "  ret i32 0",
    "}",
  ].join("\n");
};

if (process.argv.length < 3) {
  console.error("Usage: ts-node src/index.ts <source>");
  process.exit(1);
}
process.argv.slice(2).forEach((source) => {
  const input = readFileSync(source, "utf8");
  const module = parseAst(input, source);
  console.log(compile(module));
});
