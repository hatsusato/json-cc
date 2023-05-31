import { Module } from "./module";

export const compile = (module: Module): string => {
  return [
    ...module.emitHeader(),
    "define dso_local i32 @main() {",
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
  const module = new Module([], 0, source);
  console.log(compile(module));
});
