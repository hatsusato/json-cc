import Scanner = require("../generated/scanner");

const parser = new Scanner.CParser();
type ObjectType<T> = { [key: string]: T };
type ParseIndex = number | number[] | null;
type ParseElement<K extends string, A extends number> = {
  kind: K;
  age: A;
  id: number;
  children: { type?: string; value?: string } & { [key: string]: ParseIndex };
};
type AstElement = ParseElement<"ast", 0>;
type ParseResult = {
  root: AstElement[];
  top: number;
  construct: (id: number) => object;
  get: () => string;
};

const object_values_map = <T, U>(
  obj: ObjectType<T>,
  f: (value: T) => U
): ObjectType<U> =>
  Object.entries(obj).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: f(value) }),
    {}
  );
export function parse(input: string): ParseResult {
  const result: ParseResult = {
    ...parser.parse(input),
    construct(id: number) {
      return object_values_map(this.root[id].children, (value) => {
        if (typeof value === "number") {
          return this.construct(value);
        } else if (Array.isArray(value)) {
          return value.map((id) => this.construct(id));
        } else {
          return value;
        }
      });
    },
    get() {
      return JSON.stringify(this.construct(this.top));
    },
  };
  return result;
}
function run(input: string) {
  const result = parse(input);
  console.log(input.trim(), "=", result.get());
}

run("int main(void) { return 0; }");
run("int x; float y;");

function yyscan_is_typedef(str: string): boolean {
  return false;
}
