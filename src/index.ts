import { readFileSync, writeFileSync } from "fs";
import { CParser } from "../generated/scanner";

const parseAst = (source: string): string => {
  const input = readFileSync(source, "utf8");
  return new CParser().parse(input);
};

const main = (argv: string[]): number => {
  if (2 < argv.length) {
    argv.slice(2).forEach((source) => {
      if (source === "all.c") {
        const ast = parseAst(source);
        writeFileSync("all.json", JSON.stringify(ast, undefined, 2) + "\n");
      }
    });
    return 0;
  } else {
    console.error("Usage: ts-node src/index.ts SOURCE");
    return 1;
  }
};
process.exit(main(process.argv));
