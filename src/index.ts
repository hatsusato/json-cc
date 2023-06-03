import assert from "assert";
import { readFileSync } from "fs";
import { getIdentifier, parseAst } from "./ast";
import {
  IdValue,
  ModuleAdoptor,
  ModuleNode,
  type Module,
  type ModuleElem,
  type Transformer,
  type Visitor,
} from "./module";
import { isDefined, isNumber, isString, unwrap } from "./util";

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
const converts = [
  class implements Transformer {
    tag: string = "constant propagation";
    transform(
      elem: ModuleElem,
      adoptor: ModuleAdoptor
    ): ModuleNode | undefined {
      const { id, type, value } = elem;
      if (type === "integer_constant") {
        value.constant = id;
      } else if (type === "addition") {
        const left = this.getConstant(elem.value.left, adoptor);
        const right = this.getConstant(elem.value.right, adoptor);
        if (isDefined(left) && isDefined(right)) {
          assert(isString(left.token) && isString(right.token));
          const leftValue = parseInt(left.token);
          const rightValue = parseInt(right.token);
          elem.value.constant = adoptor.push({
            type: "integer_constant",
            token: `${leftValue + rightValue}`,
            value: {},
          });
        }
      }
      return elem;
    }
    getConstant(id: IdValue, adoptor: ModuleAdoptor): ModuleElem | undefined {
      if (isNumber(id)) {
        const { value } = adoptor.get(id);
        if (isNumber(value.constant)) {
          return adoptor.get(value.constant);
        }
      }
      return undefined;
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
