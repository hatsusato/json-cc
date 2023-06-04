import { readFileSync } from "fs";
import { getIdentifier, parseAst } from "./ast";
import {
  ElemAccessor,
  IdValue,
  ModuleAdoptor,
  type Module,
  type ModuleElem,
  type Transformer,
  type Visitor,
} from "./module";
import { Option, none, some } from "./option";
import { isDefined, isNumber, replaceKey } from "./util";

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
      const name = module.visit(getIdentifier, id).name?.token;
      this.funcs.push({ name, blocks: [{}] });
      return ["compound_statement"];
    } else if (type === "integer_constant") {
      this.getCurrentBlock().val = node.token;
    }
  }

  getCurrentFunc(): IrFunc {
    return this.funcs[this.funcs.length - 1];
  }

  getCurrentBlock(): IrBlock {
    const func = this.getCurrentFunc();
    return func.blocks[func.blocks.length - 1];
  }
};
const converts = [
  class implements Transformer {
    tag: string = "constant folding";
    apply(accessor: ElemAccessor): void {
      const { id, type, value } = accessor.getDefined();
      if (type === "integer_constant") {
        value.constant = id;
      } else if (type === "addition") {
        const left = accessor.at("left").at("constant").get();
        const right = accessor.at("right").at("constant").get();
        if (isDefined(left) && isDefined(right)) {
          const leftValue = parseInt(left.token);
          const rightValue = parseInt(right.token);
          value.constant = accessor.push({
            type: "integer_constant",
            token: `${leftValue + rightValue}`,
          });
        }
      }
    }
    getConstant(
      id: IdValue | undefined,
      adoptor: ModuleAdoptor
    ): Option<ModuleElem> {
      if (isNumber(id)) {
        const { value } = adoptor.get(id);
        if (isNumber(value.constant)) {
          return some(adoptor.get(value.constant));
        }
      }
      return none();
    }
  },
  class implements Transformer {
    tag: string = "type simplification";
    apply(accessor: ElemAccessor): void {
      const elem = accessor.getDefined();
      const { type } = elem;
      if (type === "function_definition") {
        replaceKey(elem.value, "declaration_specifiers", "return_type");
      } else if (type === "type_specifier") {
        const { token } = accessor.at("type_specifier").getDefined();
        elem.update({ type: "builtin type", token });
      } else if (type === "declaration_specifiers") {
        const { type, token } = accessor.at("list").choose(0).getDefined();
        elem.update({ type, token });
      }
    }
  },
];

export const compile = (module: Module): string => {
  converts.forEach((convert) => module.transform(convert));
  const funcs = module.visit(toIr).funcs;
  return [
    ...module.emitHeader(),
    ...funcs.map((func) => {
      const block = func.blocks[0];
      return [
        `define dso_local i32 @${func.name}() {`,
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
