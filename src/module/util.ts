import { isArray, isNumber } from "../util";
import { Id, IdValue, Node, NodeElem, NodeParams } from "./types";

export const idMap = <T>(x: IdValue, f: (x: Id) => T): T | T[] =>
  isNumber(x) ? f(x) : isArray(x) ? x.map(f) : x;
export const normalize = (node: NodeParams): Node => {
  const { type, token, value } = node;
  return { type, token: token ?? "", value: value ?? {} };
};
export const updateElem = (elem: NodeElem, node: NodeParams): NodeElem => {
  const { type, token, value } = normalize(node);
  [elem.type, elem.token, elem.value] = [type, token, value];
  return elem;
};
