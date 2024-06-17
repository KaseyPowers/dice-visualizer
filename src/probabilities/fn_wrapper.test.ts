import { Probability } from "./prob";
import { createProbabilityFn } from "./fn_wrapper";
import { Variable } from "./types";

const addFn = createProbabilityFn(
  (...vals: Variable[]) => vals.reduce((output, val) => output + val, 0),
  "var",
  "var"
);

describe("fn_wrapper (example: 'add')", () => {
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
