import TsCalc = require("./ts-calculator");

const txt = "2^32 / 1024";
const res = new TsCalc.TsCalcParser().parse(txt);
console.log(txt.trim(), "=", res);
