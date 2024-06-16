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
  isDataVariableType,
  isDataRangeType,
  isDataVariableArr,
  isDataEntryArr,
} from "../types";

export type DiceInnerDataTypes =
  | DataRangeType
  | Array<DataVariableType>
  | Array<DataEntryType>;

export type DiceInputTypes = DataVariableType | DiceInnerDataTypes | Dice;

export class Dice {
  private readonly data: DiceInnerDataTypes;
  // readonly type: "range" | "array" | "dice";
  static assertDice(input: unknown): asserts input is Dice {
    if (!(input instanceof Dice)) {
      throw new Error("Asserted value was a Dice instance");
    }
  }

  static isInputType(input: unknown): input is DiceInputTypes {
    return (
      input instanceof Dice ||
      isDataVariableType(input) ||
      isDataRangeType(input) ||
      isDataVariableArr(input) ||
      isDataEntryArr(input)
    );
  }

  constructor(input: DiceInputTypes) {
    if (input instanceof Dice) {
      this.data = input.data;
      this._getTotalCount = input._getTotalCount;
      this._getEntries = input._getEntries;
      this._getValues = input._getValues;
      // return now to skip standard logic when copying
      return;
    }
    // if creating a dice with a singlue value, assume syntax like `d4` that is a range from 1 to 4
    this.data = isDataVariableType(input) ? { min: 1, max: input } : input;
    let getTotalCount: typeof this._getTotalCount;
    let getEntries: typeof this._getEntries;
    let getValues: typeof this._getValues;

    if (isValidDataEntryArr(this.data, true)) {
      // If dice as entry array
      getTotalCount = () => this.entries.length;
      getEntries = () => {
        assertDataEntryArr(this.data, true);
        return this.data.toSorted((a, b) => b[0] - a[0]);
      };
      getValues = () => {
        // even if not using it, assert to make sure functions didn't get out of sync
        assertDataEntryArr(this.data, true);
        return this.entries.map((val) => val[0]);
      };
    } else {
      getEntries = () => {
        return this.values.map((val) => [val, 1]);
      };
      if (isValidDataVariableArr(this.data, true)) {
        getTotalCount = () => this.values.length;
        getValues = () => {
          assertDataVariableArr(this.data, true);
          // Insert sorting here if needed
          return this.data.toSorted((a, b) => b - a);
        };
      } else if (isValidDataRangeType(this.data, true)) {
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
        throw new Error("Unexpected input type");
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
