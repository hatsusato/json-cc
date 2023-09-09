import { readFileSync, writeFileSync } from "fs";
import { CParser } from "../generated/scanner";
import { applyTransform, convert, type Node, type Transform } from "./module";
import {
  newFlag,
  newFunction,
  newInstruction,
  newModule,
  newSymbol,
} from "./module/node";
import { getNull } from "./module/pool";
import { isDefined, unreachable } from "./util";

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
  apply(node: Node, visit: (cont: boolean) => void): void {
    if (node.type === "translation_unit") {
      visit(true);
      node.children.module = this.module;
    } else if (node.type === "function_definition") {
      node.children.function = newFunction(this.module);
      visit(false);
    }
  }
}
const makeModule = (source_filename: string): new () => Transform =>
  class extends MakeModule implements Transform {
    constructor() {
      super(source_filename);
    }
  };

class MarkDeclarator implements Transform {
  tag = "mark Declarator";
  filter = "declarator";
  apply(node: Node, visit: (cont: boolean) => void): void {
    visit(true);
    node.children.is_decl = newFlag(true);
  }
}
class MarkParameter implements Transform {
  tag = "mark Parameter";
  filter = "parameter_type_list";
  apply(node: Node, visit: (cont: boolean) => void): void {
    visit(true);
    node.children.is_param = newFlag(true);
  }
}

type SymbolTable = Record<string, Node>;
class MakeSymbolTable implements Transform {
  tag = "make SymbolTable";
  table: SymbolTable[] = [{}];
  insertSymbol(symbol: Node) {
    const table = this.table.at(-1);
    if (isDefined(table)) {
      table[symbol.getSymbol()] = symbol;
    }
  }
  lookupSymbol(symbol: string): Node {
    for (const table of [...this.table].reverse()) {
      if (symbol in table) {
        return table[symbol];
      }
    }
    return unreachable();
  }
  apply(node: Node, visit: (cont: boolean) => void): void {
    if (node.type === "declarator") {
      visit(true);
    } else if (node.type === "compound_statement") {
      this.table.push({});
      visit(true);
      this.table.pop();
    } else if (node.type === "identifier") {
      if ("is_decl" in node.children) {
        this.insertSymbol(node);
      } else {
        console.log("TODO");
      }
    }
  }
}

class MakeFunction implements Transform {
  tag = "make Function";
  filter = "function_definition";
  func: Node = getNull();
  apply(node: Node, visit: (cont: boolean) => void): void {
    if (node.type === "function_definition") {
      this.func = node.children.function;
      visit(true);
    } else if (node.type === "identifier") {
      if ("is_decl" in node.children && !("is_param" in node.children)) {
        this.func.children.name = node;
      }
    }
  }
}

class BuildBlock implements Transform {
  tag = "build Block";
  filter = "function_definition";
  func: Node = getNull();
  apply(node: Node, visit: (cont: boolean) => void): void {
    if (node.type === "function_definition") {
      this.func = node.children.function;
      visit(true);
    } else if (node.type === "jump_statement") {
      if ("return" in node.children) {
        const expr = node.children.expression;
        if (
          expr.type === "primary_expression" &&
          "integer_constant" in expr.children
        ) {
          const inst = newInstruction(this.func.getBlock(), "ret");
          inst.children.value = newSymbol(
            expr.children.integer_constant.getSymbol()
          );
        }
      }
    }
  }
}

class EmitIR implements Transform {
  tag = "emit IR";
  filter = "module";
  output: string[];
  constructor(output: string[]) {
    this.output = output;
  }
  apply(node: Node, visit: (cont: boolean) => void): void {
    if (node.type === "module") {
      const { source_filename, datalayout, triple } = node.children;
      this.output.push(
        `source_filename = "${source_filename.getSymbol()}"`,
        `target datalayout = "${datalayout.getSymbol()}"`,
        `target triple = "${triple.getSymbol()}"`
      );
    } else if (node.type === "function") {
      const name = node.children.name.getSymbol();
      this.output.push(`define dso_local i32 @${name}() {`);
      visit(true);
      this.output.push(`}`);
    } else if (
      node.type === "instruction" &&
      node.children.opcode.getSymbol() === "ret"
    ) {
      const value = node.children.value.getSymbol();
      this.output.push(`  ret i32 ${value}`);
      visit(false);
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
        [
          makeModule(source),
          MarkDeclarator,
          MarkParameter,
          MakeSymbolTable,
          MakeFunction,
          BuildBlock,
          emitIR(source, output),
        ].forEach((transform) =>
          applyTransform(translation_unit, new transform())
        );
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
