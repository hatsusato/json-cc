import assert from "assert";
import { readFileSync } from "fs";
import { parseAst } from "./ast";
import { type Id, type Module, type ModuleElem, type Visitor } from "./module";
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

interface IrFunc {
  name?: string;
}
const toIr = class implements Visitor {
  funcs: IrFunc[] = [];
  current?: Id;
  apply(node: ModuleElem, module: Module): string[] | undefined {
    const { type, id } = node;
    if (type === "function_definition") {
      const name = getDefined(module.visit(getIdentifier, id).name?.token);
      this.current = this.funcs.length;
      this.funcs.push({ name });
      return ["compund_statement"];
    } else if (type === "declarator") {
      return ["direct_declarator"];
    }
    return undefined;
  }
};

export const compile = (module: Module): string => {
  const funcs = module.visit(toIr).funcs;
  return [
    ...module.emitHeader(),
    ...funcs.map((func) => {
      return [
        `define dso_local i32 @${getString(func.name)}() {`,
        "  ret i32 0",
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
