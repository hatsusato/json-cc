import { readFileSync, writeFileSync } from "fs";
import { CParser } from "../generated/scanner";
import { applyTransform, convert, type Node, type Transform } from "./module";
import {
  newFunction,
  newInstruction,
  newModule,
  newSymbol,
} from "./module/node";
import { Option, option } from "./util";

const parse = (source: string): unknown => {
  const input = readFileSync(source, "utf8");
  return new CParser().parse(input);
};
class MakeModule implements Transform {
  tag = "make Module";
  module: Node;
  constructor(source_filename: string) {
    this.module = newModule(source_filename);
  }
  apply(node: Node, visit: () => void): void {
    if (node.type === "translation_unit") {
      visit();
      node.children.ir = this.module;
    } else if (node.type === "function_definition") {
      node.children.ir = newFunction(this.module);
    } else {
      visit();
    }
  }
}
const makeModule = (source_filename: string): new () => Transform =>
  class extends MakeModule implements Transform {
    constructor() {
      super(source_filename);
    }
  };

class MakeFunction implements Transform {
  tag = "make Function";
  filter = "function_definition";
  func: Option<Node> = option();
  apply(node: Node, visit: () => void): void {
    if (node.type === "function_definition") {
      this.func = option(node.children.ir);
      visit();
    } else if (node.type === "jump_statement" && "return" in node.children) {
      const expr = node.children.expression;
      if (
        expr.type === "primary_expression" &&
        "integer_constant" in expr.children
      ) {
        const inst = newInstruction(this.func.unwrap().getBlock(), "ret");
        inst.children.value = newSymbol(
          expr.children.integer_constant.getSymbol()
        );
      }
    } else {
      visit();
    }
  }
}

class EmitIR implements Transform {
  tag = "emit IR";
  output: string[];
  constructor(output: string[]) {
    this.output = output;
  }
  apply(node: Node, visit: () => void): void {
    if (node.type === "module") {
      const { source_filename, datalayout, triple } = node.children;
      this.output.push(
        `source_filename = "${source_filename.getSymbol()}"`,
        `target datalayout = "${datalayout.getSymbol()}"`,
        `target triple = "${triple.getSymbol()}"`
      );
      visit();
    } else if (node.type === "function") {
      const name = "main";
      this.output.push(`define dso_local i32 @${name}() {`);
      visit();
      this.output.push(`}`);
    } else if (
      node.type === "instruction" &&
      node.children.opcode.getSymbol() === "ret"
    ) {
      const value = node.children.value.getSymbol();
      this.output.push(`  ret i32 ${value}`);
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
        apply(node: Node): Node | void {
          console.info(node.show());
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
        const translation_unit = convert(ast);
        const output: string[] = [];
        applyTransform(translation_unit, makeModule(source));
        applyTransform(translation_unit, MakeFunction);
        applyTransform(translation_unit, emitIR(source, output));
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
