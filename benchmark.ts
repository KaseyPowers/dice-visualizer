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
while (inputs.length < 5) {
  inputs.push(createSingleDice({ max: randomNum(diceValRange) }));
}

// function addCases(size: number, diceAsRange: boolean) {
//   const inputs: InnerDiceArrayInput[] = [];
//   while (inputs.length < size) {
//     const diceSize = randomNum(diceValRange);
//     if (diceAsRange) {
//       inputs.push({ max: diceSize });
//     } else {
//       const doubleThreshold = Math.max(2, Math.ceil(diceSize / 3));
//       const vals = [];
//       while (vals.length < diceSize) {
//         const nextVal = randomNum(diceValRange);
//         vals.push(nextVal);
//         // using this to make sure there is always at least one duplicate
//         if (vals.length < doubleThreshold) {
//           vals.push(nextVal);
//         }
//       }
//       inputs.push(vals);
//     }
//   }
//   const suffix = `:(${size})-unique:${diceAsRange}`;
//   return [
//     b.add(`operator add${suffix}`, () => {
//       const arr = createDiceArray(inputs);
//       return () => addDice(...arr);
//     }),
//     b.add(`wrappedAdd${suffix}`, () => {
//       const arr = createDiceArray(inputs);
//       return () => wrappedAdd(...arr);
//     }),
//   ];
// }

// function addCaseSizes(sizes: number[]) {
//   return sizes.reduce<ReturnType<typeof addCases>>((output, size) => {
//     output.push(...addCases(size, true), ...addCases(size, false));
//     return output;
//   }, []);
// }

const saveOptions = {
  file: "operations",
  foler: "benchmarks",
  version: packageJson.version,
};

b.suite(
  "operations",
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
