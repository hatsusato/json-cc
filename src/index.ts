import assert from "assert";
import { readFileSync, writeFileSync } from "fs";
import { CParser } from "../generated/scanner";
import {
  applyTransform,
  convert,
  getNull,
  getPool,
  newFunction,
  newInstruction,
  newNode,
  newSymbol,
  type Node,
  type Transform,
} from "./module";
import { isDefined, unreachable } from "./util";

const parse = (source: string): unknown => {
  const input = readFileSync(source, "utf8");
  return new CParser().parse(input);
};

const setName = (src: Node, dst: Node) => {
  if ("name" in src.children) {
    dst.children.name = src.children.name;
  }
};
class SimplifyDeclarators implements Transform {
  tag = "simplify Declarators";
  filter = "declarator";
  apply(node: Node, visit: (cont: boolean | Node) => void): void {
    const visitAndSet = (src: Node) => {
      visit(src);
      setName(src, node);
    };
    if (node.type === "identifier") {
      node.children.name = node.children.symbol;
    } else if (node.type === "declarator") {
      visitAndSet(node.children.direct_declarator);
    } else if (node.type === "direct_declarator") {
      if ("identifier" in node.children) {
        visitAndSet(node.children.identifier);
      } else if ("declarator" in node.children) {
        visitAndSet(node.children.declarator);
      } else if ("direct_declarator" in node.children) {
        visitAndSet(node.children.direct_declarator);
      }
    }
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
  apply(node: Node, visit: (cont: boolean | Node) => void): void {
    if (node.type === "declarator") {
      if ("name" in node.children) {
        this.insertSymbol(node.children.name);
      } else {
        console.log("TODO");
      }
      visit(false);
    } else if (node.type === "compound_statement") {
      this.table.push({});
      visit(true);
      this.table.pop();
    }
  }
}

class MakeFunction implements Transform {
  tag = "make Function";
  filter = "function_definition";
  func: Node = getNull();
  apply(node: Node, visit: (cont: boolean | Node) => void): void {
    if (node.type === "function_definition") {
      const func = newFunction(getPool().getModule());
      setName(node.children.declarator, func);
      node.children.function = func;
      visit(false);
    }
  }
}

class CollectDeclarators implements Transform {
  tag = "collect Declarators";
  func: Node = getNull();
  allocs: Node = getNull();
  init(func: Node) {
    const allocs = newNode("allocs");
    this.func = func;
    this.allocs = func.children.allocs = allocs;
  }
  newAlloca(name: Node): Node {
    const block = this.func.getBlock();
    const inst = newInstruction(block, "alloca");
    inst.children.name = name;
    return inst;
  }
  pushInst(inst: Node) {
    const block = this.func.getBlock();
    block.children.instructions.getList().push(inst);
  }
  insertAlloc(alloc: Node) {
    const { name } = alloc.children;
    this.allocs.children[name.getSymbol()] = alloc;
  }
  apply(node: Node, visit: (cont: boolean | Node) => void): void {
    if (node.type === "function_definition") {
      this.init(node.children.function);
      visit(node.children.compound_statement);
    } else if (node.type === "declarator") {
      const inst = this.newAlloca(node.children.name);
      this.pushInst(inst);
      this.insertAlloc(inst);
    }
  }
}

class BuildBlock implements Transform {
  tag = "build Block";
  filter = "function_definition";
  func: Node = getNull();
  last: Node = getNull();
  apply(node: Node, visit: (cont: boolean | Node) => void): void {
    if (node.type === "function_definition") {
      this.func = node.children.function;
      visit(true);
    } else if (node.type === "integer_constant") {
      this.last = node.children.symbol;
    } else if (node.type === "primary_expression") {
      if ("integer_constant" in node.children) {
        visit(node.children.integer_constant);
      }
    } else if (node.type === "assignment_expression") {
      const { left, right } = node.children;
      const { identifier } = left.children;
      const name = identifier.children.symbol.getSymbol();
      const inst = newInstruction(this.func.getBlock(), "store");
      inst.children.src = right;
      inst.children.dst = this.func.children.allocs.children[name];
      visit(false);
    } else if (node.type === "jump_statement") {
      if ("return" in node.children) {
        this.last = getNull();
        visit(node.children.expression);
        if (this.last.type === "null") {
          unreachable();
        }
        const inst = newInstruction(this.func.getBlock(), "ret");
        inst.children.value = this.last;
      }
    }
  }
}

class NumberingRegisters implements Transform {
  tag = "numbering Registers";
  number: number = 0;
  apply(node: Node, visit: (cont: boolean | Node) => void): void {
    if (node.type === "function") {
      this.number = 0;
      visit(node.children.blocks);
    } else if (node.type === "block") {
      node.children.register = newSymbol(`${this.number++}`);
      visit(node.children.instructions);
    } else if (node.type === "instruction") {
      if (node.children.opcode.getSymbol() !== "store") {
        node.children.register = newSymbol(`${this.number++}`);
      }
      visit(false);
    }
  }
}

class EmitIR implements Transform {
  tag = "emit IR";
  output: string[];
  constructor(output: string[]) {
    this.output = output;
  }
  printModuleHeader(module: Node) {
    assert(module.type === "module");
    const { source_filename, datalayout, triple } = module.children;
    this.output.push(
      `source_filename = "${source_filename.getSymbol()}"`,
      `target datalayout = "${datalayout.getSymbol()}"`,
      `target triple = "${triple.getSymbol()}"`
    );
  }
  printFunctionHeader(func: Node) {
    const { name } = func.children;
    this.output.push(
      ["define", "dso_local", "i32", `@${name.getSymbol()}()`, "{"].join(" ")
    );
  }
  printInstruction(inst: Node) {
    assert(inst.type === "instruction");
    const { opcode } = inst.children;
    const op = opcode.getSymbol();
    if (op === "ret") {
      const { value } = inst.children;
      this.output.push([" ", op, "i32", value.getSymbol()].join(" "));
    } else if (op === "alloca") {
      const { register } = inst.children;
      this.output.push(
        [" ", `%${register.getSymbol()}`, "=", op, "i32,", "align", "4"].join(
          " "
        )
      );
    } else if (op === "store") {
      const { src, dst } = inst.children;
      const { integer_constant } = src.children;
      const { register } = dst.children;
      this.output.push(
        [
          " ",
          op,
          "i32",
          `${integer_constant.children.symbol.getSymbol()},`,
          "i32*",
          `%${register.getSymbol()},`,
          "align",
          "4",
        ].join(" ")
      );
    }
  }
  apply(node: Node, visit: (cont: boolean | Node) => void): void {
    if (node.type === "module") {
      this.printModuleHeader(node);
      visit(node.children.functions);
    } else if (node.type === "function") {
      this.printFunctionHeader(node);
      visit(node.children.blocks);
      this.output.push(`}`);
    } else if (node.type === "block") {
      visit(node.children.instructions);
    } else if (node.type === "instruction") {
      this.printInstruction(node);
      visit(false);
    }
  }
}
const emitIR = (output: string[]): new () => Transform =>
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
        getPool().initModule(source);
        [
          SimplifyDeclarators,
          MakeSymbolTable,
          MakeFunction,
          CollectDeclarators,
          BuildBlock,
        ].forEach((transform) =>
          applyTransform(translation_unit, new transform())
        );
        [NumberingRegisters, emitIR(output)].forEach((transform) =>
          applyTransform(getPool().getModule(), new transform())
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
