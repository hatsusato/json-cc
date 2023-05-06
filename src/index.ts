import TsCalc = require("./ts-calculator");

const parser = new TsCalc.TsCalcParser();
export function calculate(input: string): number {
  return parser.parse(input);
}
function run(input: string) {
  console.log(input.trim(), "=", calculate(input));
}

run("2^32 / 1024");
run("	PI + (3! / 3)^20 / (1+1)^10 / 1024 - 1");
