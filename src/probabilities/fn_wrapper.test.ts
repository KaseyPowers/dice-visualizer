import { Probability } from "./prob";
import { createProbabilityFn } from "./fn_wrapper";
import { Variable } from "./types";
import { ProbabilityArray } from "./prob_arr";

describe("fn_wrapper", () => {
  describe("example: add", () => {
    const addFn = createProbabilityFn(
      (...vals: Variable[]) => vals.reduce((output, val) => output + val, 0),
      "var",
      "var"
    );

    it("should allow adding variables", () => {
      const result = addFn(1, 2);
      expect(result).toBeInstanceOf(Probability);
      expect(result.entries).toEqual([[3, 1]]);
      // expect(addFn(1, 2)).toBe(3);
    });
    it("should give the same results as built in add", () => {
      const dice1 = new Probability("d4");
      const dice2 = new Probability("d6");
      const givenResult = dice1.operation("+", dice2);
      const fnResult = addFn(dice1, dice2);
      expect(fnResult).toBeInstanceOf(Probability);
      expect(givenResult.equals(fnResult as Probability)).toBeTruthy();
    });
  });

  describe("example: highest of collection", () => {
    const highestVal = createProbabilityFn(
      (...vals: Variable[]) =>
        vals
          .slice(1)
          .reduce((output, val) => (val > output ? val : output), vals[0]),
      "var",
      "var"
    );
    const highestOfArr = createProbabilityFn(
      (arr) => {
        return highestVal(...arr.data);
      },
      ["array"],
      "dice"
    );

    it("should return expected for highest of 2d4", () => {
      const arr = new ProbabilityArray([
        new Probability("d4"),
        new Probability("d4"),
      ]);
      const expectedDice = new Probability([
        [1, 1],
        [2, 3],
        [3, 5],
        [4, 7],
      ]);
      const result = highestOfArr(arr);
      expect(result).toBeInstanceOf(Probability);
      expect(result.equals(expectedDice)).toBeTruthy();
    });
  });

  describe("example: sort array", () => {
    const sortedVals = createProbabilityFn(
      (...vals: Variable[]) => vals.toSorted((a, b) => b - a),
      "var",
      "array"
    );
    const sortedArr = createProbabilityFn(
      (arr) => {
        return sortedVals(...arr.data);
      },
      ["array"],
      "array"
    );

    it("should return expected for highest of 2d4", () => {
      const arr = new ProbabilityArray([
        new Probability("d4"),
        new Probability("d4"),
      ]);
      const expectedDice1 = new Probability([
        [1, 1],
        [2, 3],
        [3, 5],
        [4, 7],
      ]);
      const expectedDice2 = new Probability([
        [1, 7],
        [2, 5],
        [3, 3],
        [4, 1],
      ]);
      const result = sortedArr(arr);
      expect(result).toBeInstanceOf(ProbabilityArray);
      const resultsData = result.data;
      expect(resultsData).toHaveLength(2);
      expect(resultsData[0].equals(expectedDice1)).toBeTruthy();
      expect(resultsData[1].equals(expectedDice2)).toBeTruthy();
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
