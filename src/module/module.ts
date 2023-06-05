import assert from "assert";
import { isNumber, isString } from "../util";
import { NodeList } from "./list";
import { TransformerManager, VisitorManager } from "./traverse";
import { Id, Transformer, Visitor } from "./types";

export class Module extends NodeList {
  private top?: Id;
  private history: string[] = [];
  private source?: string;

  getTop(): Id {
    assert(isNumber(this.top) && this.inside(this.top));
    return this.top;
  }

  finish(top: Id, source: string): Module {
    [this.top, this.source] = [top, source];
    return this;
  }

  transform<T extends Transformer>(Class: new () => T, id?: Id): T {
    const transformer = new Class();
    const manager = new TransformerManager(this, transformer);
    const [top, list] = manager.run(id ?? this.getTop());
    this.setList(list);
    this.top = top;
    this.history.push(transformer.tag);
    return transformer;
  }

  visit<T extends Visitor>(Class: new () => T, id?: Id): T {
    const visitor = new Class();
    const manager = new VisitorManager(this, visitor);
    manager.visit(id ?? this.getTop());
    return visitor;
  }

  emitHeader(): string {
    assert(isString(this.source));
    const datalayout =
      "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-f80:128-n8:16:32:64-S128";
    const triple = "x86_64-unknown-linux-gnu";
    return [
      `source_filename = "${this.source}"`,
      `target datalayout = "${datalayout}"`,
      `target triple = "${triple}"`,
    ].join("\n");
  }
}
