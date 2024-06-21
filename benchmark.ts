import b from "benny";

import { addDice } from "@/dice/functions/operations";
import { wrapFunction } from "@/dice/functions/fn_wrapper";

import { createDiceArray, createSingleDice } from "@/dice/create";
import { DiceArrayType, DiceType, InnerDiceArrayInput } from "@/dice/types";

// import packageJson from "./package.json";
const packageJson = require("./package.json");
// const b = require("benny");

// const { addDice } = require("@/dice/functions/operations");
// const { wrapFunction } = require("@/dice/functions/fn_wrapper");

// const { createSingleDice } = require("@/dice/create");
// const { DiceArrayType } = require("@/dice/types");

const wrappedAdd = wrapFunction("var", "var", (...vals) =>
  vals.reduce((output, val) => output + val, 0)
);
// const diceValRange = { max: 100, min: 4 };
const diceValRange = { max: 20, min: 4 };
function randomNum({ min = 1, max }: { max: number; min?: number }): number {
  return min + Math.round((max - min) * Math.random());
}
const inputs: DiceType[] = [];
while (inputs.length <= 5) {
  inputs.push(createSingleDice({ max: randomNum(diceValRange) }));
}

const saveOptions = {
  file: "operations",
  foler: "benchmarks",
  version: packageJson.version,
};

b.suite(
  "operations",
  b.add("operator add vars", () => {
    const arr = Array.from({ length: 100 }, (_, i) => i);
    return () => addDice(...arr);
  }),
  b.add("wrapped add vars", () => {
    const arr = Array.from({ length: 100 }, (_, i) => i);
    return () => addDice(...arr);
  }),
  b.add(`operator add 2`, () => {
    addDice(...inputs.slice(0, 2));
  }),
  b.add(`wrappedAdd 2`, () => {
    addDice(...inputs.slice(0, 2));
  }),
  b.add(`operator add`, () => {
    addDice(...inputs);
  }),
  b.add(`wrappedAdd`, () => {
    addDice(...inputs);
  }),
  b.cycle(),
  b.complete(),
  b.save(saveOptions),
  b.save({ ...saveOptions, format: "table.html" }),
  b.save({ ...saveOptions, format: "chart.html" })
);
