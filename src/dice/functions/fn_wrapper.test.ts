import { wrapArraySpreadFn, wrapFunction } from "./fn_wrapper";
import { DiceType, VarType } from "../types";
import { isDiceArrayType, isDiceType, isVarType } from "../type_check";
import { createDiceArray, createSingleDice } from "../create";
import { diceOperation } from "./operations";
import { diceEqual, dataTypeEqual, diceArrayEqual } from "../utils/utils";
// import { Variable } from "./types";
// import { ProbabilityArray } from "./prob_arr";

describe("fn_wrapper", () => {
  describe("example: add", () => {
    const addFn = wrapFunction("var", "var", (...vals) =>
      vals.reduce((output, val) => output + val, 0)
    );

    it("should allow adding variables and return a variable", () => {
      expect(addFn(1, 2)).toBe(3);
    });

    it("should allow adding a dice and var", () => {
      const inputArray = [1, 2, 3, 4];
      const inputDice = createSingleDice(inputArray);
      const toAdd = 5;
      const expectedArray = inputArray.map((val) => val + toAdd);
      const expectedDice = createSingleDice(expectedArray);
      const result = addFn(inputDice, toAdd);
      // NOTE: maybe possible to have this typed correctly automatically. If feeling fancy
      expect(isDiceType(result)).toBeTruthy();
      expect(result).toEqual(expectedDice);
      expect(dataTypeEqual(result, expectedDice)).toBeTruthy();
    });

    /**
     * Output for d4 + d6
     * 2,(4+1/6) = 1/24
     * 3,(8+1/3) = 2/24
     * 4,12.5, = 3
     * 5,(16+2/3) = 4
     * 6,"" = 4
     * 7,"" = 4
     * 8,12.5 = 3
     * 9,(8+1/3) = 2
     * 10,(4+1/6) = 1
     */
    it("should add 2 dice", () => {
      const dice1 = createSingleDice({ max: 4 });
      const dice2 = createSingleDice({ max: 6 });
      const expectedResult = createSingleDice([
        [2, 1],
        [3, 2],
        [4, 3],
        [5, 4],
        [6, 4],
        [7, 4],
        [8, 3],
        [9, 2],
        [10, 1],
      ]);
      const fnResult = addFn(dice1, dice2);
      expect(dataTypeEqual(fnResult, expectedResult)).toBeTruthy();
    });
    it("should give the same results as built in add", () => {
      const dice1 = createSingleDice({ max: 4 });
      const dice2 = createSingleDice({ max: 6 });
      const opResult = diceOperation("+", dice1, dice2);
      const fnResult = addFn(dice1, dice2);
      expect(dataTypeEqual(opResult, fnResult)).toBeTruthy();
    });
  });

  describe("wrapArraySpreadFn", () => {
    describe("example: highest of collection", () => {
      const largestVal = wrapArraySpreadFn("var", "var", (...vals) =>
        Math.max(...vals)
      );

      it("should return expected for highest of 2d4", () => {
        const arr = createDiceArray([{ max: 4 }, { max: 4 }]);
        const expectedDice = createSingleDice([
          [1, 1],
          [2, 3],
          [3, 5],
          [4, 7],
        ]);
        const result = largestVal(arr);
        expect(isDiceType(result)).toBeTruthy();
        expect(diceEqual(result as DiceType, expectedDice)).toBeTruthy();
      });
    });

    describe("example: sort array", () => {
      const sortedArr = wrapArraySpreadFn("var", "array", (...vals) =>
        vals.toSorted((a, b) => b - a)
      );

      it("should return sorted values", () => {
        const arr = createDiceArray([{ max: 4 }, { max: 4 }]);
        const expectedDice1 = createSingleDice([
          [1, 1],
          [2, 3],
          [3, 5],
          [4, 7],
        ]);
        const expectedDice2 = createSingleDice([
          [1, 7],
          [2, 5],
          [3, 3],
          [4, 1],
        ]);
        const result = sortedArr(arr);
        expect(isDiceArrayType(result)).toBeTruthy();
        expect(result).toHaveLength(2);
        expect(
          diceArrayEqual(result, [expectedDice1, expectedDice2])
        ).toBeTruthy();
      });

      // this is partially a test of the sorting method, but because the input function doesn't modify inner values, it could help indicate the math is wrong
      it("should not impact the sum of array", () => {
        const arr = createDiceArray([{ max: 4 }, { max: 4 }, { max: 6 }]);
        const sorted = sortedArr(arr);
        const sumInput = diceOperation("+", ...arr);
        const sumSorted = diceOperation("+", ...sorted);
        expect(diceEqual(sumInput, sumSorted));
      });
    });
  });

  /**
   * Output for highest 1 of 2d4
   * 1,6.25 = 1/16
   * 2,18.75 = 3/16
   * 3,31.25 = 5/16
   * 4,43.75 = 7/16
   *
   * Output for lowest of same
   * 1,43.75
   * 2,31.25
   * 3,18.75
   * 4,6.25
   *
   */

  /**
   *
   * Combining notes:
   * say we are sorting 2d3 ([1, 2, 3, 3])
   * inputs: [d3, d3] or [[1, 2, 3], [1, 2, 3]] with each combination:
   * [1, 1], [1, 2], .. [3, 1]
   *
   */
});
