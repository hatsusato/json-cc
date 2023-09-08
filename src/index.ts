import { readFileSync, writeFileSync } from "fs";
import { CParser } from "../generated/scanner";
import { applyTransforms, convert, type Transform, type Value } from "./module";
import {
  newFunction,
  newInstruction,
  newModule,
  newSymbol,
} from "./module/value";
import { Option, option } from "./util";

const parse = (source: string): unknown => {
  const input = readFileSync(source, "utf8");
  return new CParser().parse(input);
};
class MakeModule implements Transform {
  tag = "make Module";
  module: Value;
  constructor(source_filename: string) {
    this.module = newModule(source_filename);
  }
  apply(value: Value, visit: () => void): void {
    if (value.type === "translation_unit") {
      visit();
      value.children.ir = this.module;
    } else if (value.type === "function_definition") {
      value.children.ir = newFunction(this.module);
    } else {
      visit();
    }
  }
}
const makeModule = (source_filename: string): new () => Transform =>
  class extends MakeModule {
    constructor() {
      super(source_filename);
    }
  };

class MakeFunction implements Transform {
  tag = "make Function";
  func: Option<Value> = option();
  apply(value: Value, visit: () => void): void {
    if (value.type === "function_definition") {
      this.func = option(value.children.ir);
      visit();
    } else if (value.type === "jump_statement" && "return" in value.children) {
      const expr = value.children.expression;
      if (
        expr.type === "primary_expression" &&
        "integer_constant" in expr.children
      ) {
        const inst = newInstruction(this.func.unwrap().getBlock(), "ret");
        inst.children.value = newSymbol(
          expr.children.integer_constant.symbol.unwrap()
        );
      }
    } else {
      visit();
    }
  }
}
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

class EmitIR implements Transform {
  tag = "emit IR";
  output: string[];
  constructor(output: string[]) {
    this.output = output;
  }
  apply(value: Value, visit: () => void): void {
    if (value.type === "module") {
      const { source_filename, datalayout, triple } = value.children;
      this.output.push(
        `source_filename = "${source_filename.getSymbol()}"`,
        `target datalayout = "${datalayout.getSymbol()}"`,
        `target triple = "${triple.getSymbol()}"`
      );
      visit();
    } else if (value.type === "function") {
      const name = "main";
      this.output.push(`define dso_local i32 @${name}() {`);
      visit();
      this.output.push(`}`);
    } else if (value.type === "inst.ret") {
      const ret = value.children.value.getSymbol();
      this.output.push(`  ret i32 ${ret}`);
      visit();
    } else {
      visit();
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
    : class extends EmitIR {
        constructor() {
          super(output);
        }
      };
const main = (argv: string[]): number => {
  if (2 < argv.length) {
    argv.slice(2).forEach((source) => {
      const ast = parse(source);
      if (source === "all.c") {
        writeFileSync("all.json", JSON.stringify(ast, undefined, 2) + "\n");
      } else {
        convert(ast);
        const output: string[] = [];
        applyTransforms([
          makeModule(source),
          MakeFunction,
          emitIR(source, output),
        ]);
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
