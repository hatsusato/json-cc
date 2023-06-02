import assert from "assert";
import { readFileSync } from "fs";
import { getName, parseAst } from "./ast";
import {
  type Id,
  type Module,
  type ModuleNode,
  type Transformer,
} from "./module";
import { isNumber } from "./util";

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

const liftName = class implements Transformer {
  apply(
    id: Id,
    get: (id: number) => ModuleNode,
    push: (node: ModuleNode) => number
  ): ModuleNode | undefined {
    const node = get(id);
    const { type, value } = node;
    if (type === "function_definition") {
      const name = getIdentifier(id, get);
      assert(isNumber(name));
      value.name = name;
    }
    return node;
  }
};

export const compile = (module: Module): string => {
  module.transform(liftName);
  const name = module.visit(getName).result();
  return [
    ...module.emitHeader(),
    `define dso_local i32 @${name}() {`,
    "  %1 = alloca i32, align 4",
    "  store i32 0, i32* %1, align 4",
    "  ret i32 0",
    "}",
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
