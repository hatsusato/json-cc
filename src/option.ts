import assert from "assert";
import { isDefined } from "./util";

export interface Some<T> {
  readonly ok: true;
  readonly value: T;
}
export interface None {
  readonly ok: false;
}
export type Option<T> = Some<T> | None;

export const some = <T>(value: T): Some<T> => ({ ok: true, value });
export const none = (): None => ({ ok: false });
export const option = <T>(value?: T): Option<T> =>
  isDefined(value) ? some(value) : none();
export const isNone = (option: Option<unknown>): option is None => !option.ok;
export const isSome = <T>(option: Option<T>): option is Some<T> => option.ok;
export const unwrap = <T>(option?: Option<T>): T => {
  assert(isDefined(option) && isSome(option));
  return option.value;
};
