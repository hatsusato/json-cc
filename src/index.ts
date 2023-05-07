import Scanner = require("../generated/scanner");

const parser = new Scanner.CParser();
export function parse(input: string): string {
  return JSON.stringify(parser.parse(input));
}
function run(input: string) {
  console.log(input.trim(), "=", parse(input));
}

// run("int main(void) { return 0; }");
// run("int x; float y;");
run("int x");

function yyscan_is_typedef(str: string): boolean {
  return false;
}
