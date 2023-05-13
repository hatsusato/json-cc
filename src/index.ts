import { parse } from "./ast";

export function run(input: string): void {
  const root = parse(input);
  const result = root.get_top();
  console.log(input.trim(), "=", result);
  console.log(root.getName(root.top));
}

const emitHeader = (source: string): string[] => {
  const datalayout =
    "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-f80:128-n8:16:32:64-S128";
  const triple = "x86_64-unknown-linux-gnu";
  return [
    `source_filename = "${source}"`,
    `target datalayout = "${datalayout}"`,
    `target triple = "${triple}"`,
  ];
};
export const compile = (source: string): string => {
  return [
    ...emitHeader(source),
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
  console.log(compile(source));
});
