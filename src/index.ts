import { readFileSync, writeFileSync } from "fs";
import { CParser } from "../generated/scanner";
import { convert, type Transform, type Value } from "./module";

const parse = (source: string): unknown => {
  const input = readFileSync(source, "utf8");
  return new CParser().parse(input);
};
const modulePrinter = class implements Transform {
  tag = "module printer";
  apply(value: Value): number | void {
    const { module: _, ...rest } = value;
    console.log(rest);
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
