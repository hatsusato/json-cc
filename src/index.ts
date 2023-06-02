import { readFileSync } from "fs";
import { getIdentifier, parseAst } from "./ast";
import { type Module, type ModuleElem, type Visitor } from "./module";
import { unwrap } from "./util";

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
      const name = unwrap(module.visit(getIdentifier, id).name?.token);
      this.funcs.push({ name, blocks: [{}] });
      return ["compound_statement"];
    } else if (type === "integer_constant") {
      this.getCurrentBlock().val = unwrap(node.token);
    }
    return undefined;
  }

  getCurrentFunc(): IrFunc {
    return this.funcs[unwrap(this.funcs.length - 1)];
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
        `define dso_local i32 @${unwrap(func.name)}() {`,
        `  ret i32 ${unwrap(block.val)}`,
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
