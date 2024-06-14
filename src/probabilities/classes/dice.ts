import { GetterFn } from "@/utils/types";
import { getOnce } from "@/utils/getter_helpers";

import type { DataVariableType, DataRangeType, DataEntryType } from "../types";

import {
  dataRangeTotal,
  assertDataEntryArr,
  assertDataRangeType,
  assertDataVariableArr,
  isValidDataEntryArr,
  isValidDataRangeType,
  isValidDataVariableArr,
} from "../types";

export type DiceInnerDataTypes =
  | DataRangeType
  | Array<DataVariableType>
  | Array<DataEntryType>;

export class Dice {
  private readonly data: DiceInnerDataTypes;
  readonly type: "range" | "array" | "dice";
  static assertDice(input: unknown): asserts input is Dice {
    if (!(input instanceof Dice)) {
      throw new Error("Asserted value was a Dice instance");
    }
  }
  constructor(input: DiceInnerDataTypes | Dice) {
    if (input instanceof Dice) {
      this.data = input.data;
    } else {
      this.data = input;
    }
    // get type again, to verify that it's valid and correct to input class if needed.
    if (isValidDataRangeType(this.data, true)) {
      this.type = "range";
    } else if (isValidDataVariableArr(this.data, true)) {
      this.type = "array";
    } else if (isValidDataEntryArr(this.data, true)) {
      this.type = "dice";
    } else {
      throw new TypeError(
        "Invalid data type, expected a range, or an array with variables or entries"
      );
    }

    if (input instanceof Dice) {
      if (this.type !== input.type) {
        throw new Error(
          `Copying input instance, it had type ${input.type} but checking data got ${this.type}`
        );
      }
      this._getTotalCount = input._getTotalCount;
      this._getEntries = input._getEntries;
      this._getValues = input._getValues;
      // return now to be done constructing
      return;
    }

    let getTotalCount: typeof this._getTotalCount;
    let getEntries: typeof this._getEntries;
    let getValues: typeof this._getValues;

    // Type and getters are defined every time to make sure they are correct
    // NOTE: getters should run once (even in copies, so worth doing the assertions to verify)
    if (this.type === "dice") {
      getTotalCount = () => this.entries.length;
      getEntries = () => {
        assertDataEntryArr(this.data, true);
        return this.data;
      };
      getValues = () => {
        return this.entries.map((val) => val[0]);
      };
    } else {
      getEntries = () => {
        return this.values.map((val) => [val, 1]);
      };
      if (this.type === "range") {
        getTotalCount = () => {
          assertDataRangeType(this.data, true);
          return dataRangeTotal(this.data as DataRangeType);
        };
        getValues = () => {
          assertDataRangeType(this.data, true);
          const { min, max } = this.data;
          let output: Array<DataVariableType> = [];
          for (let i = max; i >= min; i -= 1) {
            output.push(i);
          }
          return output;
        };
      } else {
        getTotalCount = () => this.values.length;
        getValues = () => {
          assertDataVariableArr(this.data, true);
          // Insert sorting here if needed
          return this.data;
        };
      }
    }
    // wrap each with a getOnce
    this._getTotalCount = getOnce(getTotalCount);
    this._getEntries = getOnce(getEntries);
    this._getValues = getOnce(getValues);
  }

  private _getTotalCount: GetterFn<number>;
  // the total number of values in this item.
  get totalCount(): number {
    return this._getTotalCount();
  }

  // Entries and Values gettter default depend on each other, need to redefine one of them to avoid an error
  private _getEntries: GetterFn<ReadonlyArray<DataEntryType>>;
  // get all value-count pairs of this data item
  get entries(): ReadonlyArray<DataEntryType> {
    return this._getEntries();
  }

  private _getValues: GetterFn<ReadonlyArray<DataVariableType>>;
  // return all values in this item
  get values(): ReadonlyArray<DataVariableType> {
    return this._getValues();
  }
}
