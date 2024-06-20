import { wrapArraySpreadFn, wrapFunction } from "./fn_wrapper";
import { DiceType, VarType } from "../types";
import { isDiceArrayType, isDiceType, isVarType } from "../type_check";
import { createDiceArray, createSingleDice } from "../create";
import { addDice, diceOperation } from "./operations";
import { diceEqual, dataTypeEqual, diceArrayEqual } from "../utils/utils";
// import { Variable } from "./types";
// import { ProbabilityArray } from "./prob_arr";

describe("operations add", () => {
  it("should handle large numbers of vars", () => {
    const arr = Array.from({ length: 1000 }, (_) => 1);
    const result = addDice(...arr);
    expect(dataTypeEqual(result, 1000)).toBeTruthy();
  });
  it("should handle a large amount of dice without breaking", () => {
    const arr = Array.from({ length: 25 }, (_, i) => {
      if (i < 4) {
        return Math.max(i, 1);
      }
      return createSingleDice({ max: i });
    });
    const result = addDice(...arr);
    expect(isDiceType(result)).toBeTruthy();
  });
});
