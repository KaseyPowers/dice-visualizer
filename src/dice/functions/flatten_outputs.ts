import type {
  DiceType,
  DiceArrayType,
  VarEntry,
  DiceFnResult,
  DiceArrayFnResult,
} from "../types";
import { simplifyDice } from "../utils/simplify_dice";
import { diceTotalCount } from "../utils/utils";

export function flattenDiceResults(values: DiceFnResult[]): DiceType {
  const output: DiceType = [];
  let multiplier = 1;

  values.forEach(([val, count]) => {
    if (count < 1) {
      throw new Error("Invalid entry, count expected >= 1");
    }
    const valCount = diceTotalCount(val);
    if (valCount < 1) {
      throw new Error("Expected count of dice to be >= 1");
    }
    const addingMultiplier = count * multiplier;
    if (valCount > 1) {
      output.forEach((entry) => {
        entry[1] * valCount;
      });
      multiplier = multiplier * valCount;
    }
    output.push(
      ...(addingMultiplier === 1
        ? val
        : val.map<VarEntry>((entry) => [entry[0], entry[1] * addingMultiplier]))
    );
  });

  return simplifyDice(output);
}

export function flattenDiceArrayResults(
  values: DiceArrayFnResult[]
): DiceArrayType {
  const asDiceResults: DiceFnResult[][] = [];
  values.forEach(([val, count]) => {
    val.forEach((item, index) => {
      if (!asDiceResults[index]) {
        asDiceResults[index] = [];
      }
      asDiceResults[index].push([item, count]);
    });
  });
  return asDiceResults.map((diceResults) => flattenDiceResults(diceResults));
}
