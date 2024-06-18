import { getOnce } from "@/utils/getter_helpers";
import { Probability, ProbabilityInputType } from "./prob";
import { EntryType, VariableEntryArray } from "./types";

export type ProbabilityArrayInputType =
  | Probability
  | ProbabilityInputType
  | Array<Probability | ProbabilityInputType>;

export class ProbabilityArray {
  readonly data: Array<Probability>;
  // TODO: parse if we want
  constructor(input: Array<Probability>) {
    this.data = input;
  }

  private static isArrayInputArray(
    input: unknown
  ): input is Array<Probability | ProbabilityInputType> {
    return (
      Array.isArray(input) &&
      input.every(
        (val) => val instanceof Probability || Probability.isValidInput(val)
      )
    );
  }

  static flattenArrayOutputs(
    input: EntryType<ProbabilityArrayInputType | ProbabilityArray>[]
  ): Probability[] {
    const forProbabilities: EntryType<Probability | ProbabilityInputType>[][] =
      [];
    input.forEach(([val, count]) => {
      let arrayVals: Array<Probability | ProbabilityInputType>;
      if (this.isArrayInputArray(val)) {
        arrayVals = val;
      } else if (val instanceof ProbabilityArray) {
        arrayVals = val.data;
      } else {
        arrayVals = [val];
      }
      arrayVals.forEach((item, index) => {
        if (typeof forProbabilities[index] === "undefined") {
          forProbabilities[index] = [];
        }
        // spread this count to each set of entries
        forProbabilities[index].push([item, count]);
      });
    });
    return forProbabilities.map((values) => Probability.flattenOutputs(values));
  }
  static flattenOutputs(
    input: EntryType<ProbabilityArrayInputType | ProbabilityArray>[]
  ) {
    return new ProbabilityArray(this.flattenArrayOutputs(input));
  }

  private _toSingleValue = getOnce(() => {
    const [first, second, ...rest] = this.data;
    if (typeof first === "undefined") {
      throw new Error("Can't condense an empty array");
    }
    if (typeof second === "undefined") {
      return first;
    }
    return Probability.operation("+", first, second, ...rest);
  });
  toSingleValue() {
    return this._toSingleValue();
  }
}

/**
 * Output for highest 1 of 2d4
 * 1,6.25 = 1/16
 * 2,18.75 = 3/16
 * 3,31.25 = 5/16
 * 4,43.75 = 7/16
 */

/**
 *
 * Combining notes:
 * say we are sorting 2d3 ([1, 2, 3, 3])
 * inputs: [d3, d3] or [[1, 2, 3], [1, 2, 3]] with each combination:
 * [1, 1], [1, 2], .. [3, 1]
 *
 */
