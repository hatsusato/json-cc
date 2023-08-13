import { readFileSync, writeFileSync } from "fs";
import { CParser } from "../generated/scanner";
import { convert, type Transform, type Value } from "./module";

const parse = (source: string): unknown => {
  const input = readFileSync(source, "utf8");
  return new CParser().parse(input);
};
const printModule = class implements Transform {
  tag = "print module";
  apply(value: Value): Value | void {
    console.info(value.show());
  }
};

const main = (argv: string[]): number => {
  if (2 < argv.length) {
    argv.slice(2).forEach((source) => {
      const ast = parse(source);
      if (source === "all.c") {
        writeFileSync("all.json", JSON.stringify(ast, undefined, 2) + "\n");
      } else {
        const module = convert(ast);
        module.transform([modulePrinter]);
      }
    });
    return 0;
  } else {
    console.error("Usage: ts-node src/index.ts SOURCE");
    return 1;
  }
};
process.exit(main(process.argv));
