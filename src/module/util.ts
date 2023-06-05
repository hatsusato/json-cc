import { isArray, isNumber } from "../util";
import { Id, IdValue } from "./types";

export const idMap = <T>(x: IdValue, f: (x: Id) => T): T | T[] =>
  isNumber(x) ? f(x) : isArray(x) ? x.map(f) : x;

export class CheckList {
  private list: Record<Id, true> = {};
  check(id: Id): boolean {
    const old = id in this.list;
    this.list[id] = true;
    return old;
  }
}
