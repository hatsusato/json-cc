import assert from "assert";
import { readFileSync } from "fs";
import { getIdentifier, parseAst } from "./ast";
import {
  Id,
  IdValue,
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
    apply(
      elem: ModuleElem,
      get: (id: Id) => ModuleElem,
      push: (node: ModuleNode) => Id
    ): ModuleNode | undefined {
      const { id, type, value } = elem;
      if (type === "integer_constant") {
        value.constant = id;
      } else if (type === "addition") {
        const left = this.getConstant(elem.value.left, get);
        const right = this.getConstant(elem.value.right, get);
        if (isDefined(left) && isDefined(right)) {
          assert(isString(left.token) && isString(right.token));
          const leftValue = parseInt(left.token);
          const rightValue = parseInt(right.token);
          elem.value.constant = push({
            type: "integer_constant",
            token: `${leftValue + rightValue}`,
            value: {},
          });
        }
      }
      return elem;
    }
    getConstant(
      id: IdValue,
      get: (id: Id) => ModuleElem
    ): ModuleElem | undefined {
      if (isNumber(id)) {
        const { value } = get(id);
        if (isNumber(value.constant)) {
          return get(value.constant);
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
