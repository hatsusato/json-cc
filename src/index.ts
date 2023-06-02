import assert from "assert";
import { readFileSync } from "fs";
import { parseAst } from "./ast";
import {
  type Id,
  type Module,
  type ModuleElem,
  type ModuleNode,
  type Transformer,
  type Visitor,
} from "./module";
import { getNumber, getString, isNumber } from "./util";

const getIdentifier = (id: Id, get: (id: number) => ModuleNode): Id => {
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
  const { type, value } = get(id);
  if (type === "identifier") {
    return id;
  } else {
    assert(type in getKey);
    const key = getKey[type as keyof typeof getKey];
    const id = value[key];
    assert(isNumber(id));
    return getIdentifier(id, get);
  }
};

const converts: Array<new () => Transformer> = [
  class implements Transformer {
    apply(id: Id, get: (id: number) => ModuleElem): ModuleNode | undefined {
      const node = get(id);
      const { type, value } = node;
      if (type === "function_definition") {
        const name = getIdentifier(id, get);
        assert(isNumber(name));
        value.name = name;
      }
      return node;
    }
  },
];

interface IrFunc {
  name: string;
}
const extractDefines = class implements Visitor {
  funcs: IrFunc[] = [];
  apply(node: ModuleElem, module: Module): string[] | undefined {
    if (node.type === "function_definition") {
      const nameId = getNumber(node.get("name"));
      const name = getString(module.at(nameId).token);
      this.funcs.push({ name });
      return [];
    }
  }
};

export const compile = (module: Module): string => {
  converts.forEach((convert) => module.transform(convert));
  const funcs = module.visit(extractDefines).funcs;
  return [
    ...module.emitHeader(),
    ...funcs.map((func) => {
      return [
        `define dso_local i32 @${func.name}() {`,
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
