import assert from "assert";
import { option, type Option } from "../util";
import { NodeList } from "./list";
import { TransformerManager, VisitorManager } from "./traverse";
import { type Id, type Transformer, type Visitor } from "./types";

export class Module extends NodeList {
  private top: Option<Id> = option();
  private history: string[] = [];
  private source: Option<string> = option();

  getTop(): Id {
    assert(this.top.ok);
    const top = this.top.unwrap;
    assert(this.inside(top));
    return top;
  }

  finish(top: Id, source: string): Module {
    [this.top, this.source] = [option(top), option(source)];
    return this;
  }

  transform<T extends Transformer>(Class: new () => T, id?: Id): T {
    const transformer = new Class();
    const manager = new TransformerManager(this, transformer);
    const [top, list] = manager.run(id ?? this.getTop());
    this.setList(list);
    this.top = option(top);
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
    assert(this.source.ok);
    const datalayout =
      "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-f80:128-n8:16:32:64-S128";
    const triple = "x86_64-unknown-linux-gnu";
    return [
      `source_filename = "${this.source.unwrap}"`,
      `target datalayout = "${datalayout}"`,
      `target triple = "${triple}"`,
    ].join("\n");
  }
}
