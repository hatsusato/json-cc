import { readFileSync, writeFileSync } from "fs";
import { CParser } from "../generated/scanner";
import { convert, type Transform, type Value } from "./module";

const parse = (source: string): unknown => {
  const input = readFileSync(source, "utf8");
  return new CParser().parse(input);
};
class ConvertIR implements Transform {
  tag = "convert IR";
  apply(value: Value, visit: () => void): void {
    visit();
    if (value.type === "top") {
      // return value.children.translation_unit;
    } else if (value.type === "translation_unit") {
      value.type = "module";
    } else if (value.type === "compound_statement") {
      // return value.children.statement_list;
    } else if (value.type === "statement_list") {
      // return value.list?.[0];
    } else if (value.type === "statement") {
      // return value.children.jump_statement;
    } else if (value.type === "jump_statement") {
      if ("return" in value.children) {
        value.type = "return_statement";
      }
    }
  }
}

const emitIR = (
  source_filename: string,
  output: string[]
): new () => Transform =>
  process.env.DEBUG === "1"
    ? class implements Transform {
        tag = "print module";
        apply(value: Value): Value | void {
          console.info(value.show());
        }
      }
    : class implements Transform {
        tag = "emit IR";
        apply(value: Value, visit: () => void): void | Value {
          if (value.type === "module") {
            const datalayout =
              "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-f80:128-n8:16:32:64-S128";
            const triple = "x86_64-unknown-linux-gnu";
            output.push(
              `source_filename = "${source_filename}"`,
              `target datalayout = "${datalayout}"`,
              `target triple = "${triple}"`
            );
            visit();
          } else if (value.type === "function_definition") {
            const name =
              value.children.declarator.children.direct_declarator.children
                .direct_declarator.children.identifier.symbol;
            output.push(`define dso_local i32 @${name}() {`);
            visit();
            output.push(`}`);
          } else if (value.type === "return_statement") {
            const ret =
              value.children.expression.children.integer_constant.symbol;
            output.push(`  ret i32 ${ret}`);
          } else {
            visit();
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
        const output: string[] = [];
        module.transform([ConvertIR, emitIR(source, output)]);
        console.log(output.join("\n"));
      }
    });
    return 0;
  } else {
    console.error("Usage: ts-node src/index.ts SOURCE");
    return 1;
  }
};
process.exit(main(process.argv));
