import assert from "assert";
import { readFileSync } from "fs";
import { parseAst } from "./ast";
import { type Module, type ModuleElem, type Visitor } from "./module";
import { getDefined, getString } from "./util";

const getIdentifier = class implements Visitor {
  name?: ModuleElem;
  apply(node: ModuleElem, module: Module): string[] | undefined {
    const getKey = {
      declaration: "init_declarator_list",
      init_declarator: "declarator",
      declarator: "direct_declarator",
      identifier_direct_declarator: "identifier",
      paren_direct_declarator: "declarator",
      bracket_direct_declarator: "direct_declarator",
      parameter_direct_declarator: "direct_declarator",
      old_direct_declarator: "direct_declarator",
      external_declaration: "declaration",
      function_definition: "declarator",
    };
    const { type } = node;
    if (type === "identifier") {
      this.name = node;
      return [];
    } else if (type in getKey) {
      const key = getKey[type as keyof typeof getKey];
      return [key];
    } else {
      assert(false);
    }
  }
};

interface IrBlock {
  val?: string;
}
interface IrFunc {
  name?: string;
  blocks: IrBlock[];
}
const toIr = class implements Visitor {
  funcs: IrFunc[] = [];
  apply(node: ModuleElem, module: Module): string[] | undefined {
    const { type, id } = node;
    if (type === "function_definition") {
      const name = getDefined(module.visit(getIdentifier, id).name?.token);
      this.funcs.push({ name, blocks: [{}] });
      return ["compound_statement"];
    } else if (type === "integer_constant") {
      this.getCurrentBlock().val = getString(node.token);
    }
    return undefined;
  }

  getCurrentFunc(): IrFunc {
    return this.funcs[getDefined(this.funcs.length - 1)];
  }

  getCurrentBlock(): IrBlock {
    const func = this.getCurrentFunc();
    return func.blocks[func.blocks.length - 1];
  }
};

export const compile = (module: Module): string => {
  const funcs = module.visit(toIr).funcs;
  return [
    ...module.emitHeader(),
    ...funcs.map((func) => {
      const block = func.blocks[0];
      return [
        `define dso_local i32 @${getString(func.name)}() {`,
        `  ret i32 ${block.val}`,
        "}",
      ].join("\n");
    }),
  ].join("\n");
};

if (process.argv.length < 3) {
  console.error("Usage: ts-node src/index.ts <source>");
  process.exit(1);
}
process.argv.slice(2).forEach((source) => {
  const input = readFileSync(source, "utf8");
  const module = parseAst(input, source);
  console.log(compile(module));
});
