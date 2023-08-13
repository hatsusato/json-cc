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
class ConvertIR implements Transform {
  tag = "convert IR";
  apply(value: Value, visit: () => void): Value | void {
    visit();
    if (value.type === "translation_unit") {
      if ("translation_unit" in value.children)
        return value.children.translation_unit;
      else value.type = "module";
    } else if (value.type === "compound_statement") {
      return value.children.statement_list;
    } else if (value.type === "statement_list") {
      return value.list?.[0];
    } else if (value.type === "statement") {
      return value.children.jump_statement;
    } else if (value.type === "jump_statement") {
      if ("return" in value.children) {
        value.type = "return_statement";
      }
    }
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
        module.transform([ConvertIR, modulePrinter]);
      }
    });
    return 0;
  } else {
    console.error("Usage: ts-node src/index.ts SOURCE");
    return 1;
  }
};
process.exit(main(process.argv));
