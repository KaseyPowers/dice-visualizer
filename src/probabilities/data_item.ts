import { GetterFn } from "@/utils/types";
import { getOnce } from "@/utils/getter_helpers";
import {
  assertDataEntryArr,
  assertDataRangeType,
  assertDataVariableArr,
  isValidDataEntryArr,
  isValidDataRangeType,
  isValidDataVariableArr,
} from "./types/type_checks";
import type {
  DataVariableType,
  DataRangeType,
  DataEntryType,
  DataItemDataTypes,
} from "./types";
import { dataRangeTotal } from "./types";
import { toUniqueEntryVars } from "./utils/utilities";
import { minimizeEntryCounts } from "./utils/dice_gcd";
// const isDataVariable = (input: unknown): input is DataVariable => (typeof input === "number");
/**
 * Thoughts/Questions:
 * - Should entries/values always return in a certain order (for quick access to largest/smallest etc.)- to copy AnyDice
 *  - if we do, how would we do this for a collection when the order of dice could fluctuate more?
 *      - maybe only on collections of the same type (ex. 4d4 type, or DataVariable[])
 */

export class DataItem {
  private readonly data: DataItemDataTypes;
  readonly type: "range" | "array" | "dice";

  //   static parse()

  private constructor(input: DataItemDataTypes | DataItem) {
    if (input instanceof DataItem) {
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
    if (input instanceof DataItem) {
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

    // Type and getters are defined every time to make sure they are correct
    // NOTE: getters should run once (even in copies, so worth doing the assertions to verify)
    if (this.type === "dice") {
      this._getTotalCount = () => this.entries.length;
      this._getEntries = () => {
        assertDataEntryArr(this.data, true);
        return this.data;
      };
      this._getValues = () => {
        return this.entries.map((val) => val[0]);
      };
    } else {
      this._getEntries = () => {
        return this.values.map((val) => [val, 1]);
      };
      if (this.type === "range") {
        this._getTotalCount = () => {
          assertDataRangeType(this.data, true);
          return dataRangeTotal(this.data as DataRangeType);
        };
        this._getValues = () => {
          assertDataRangeType(this.data, true);
          const { min, max } = this.data;
          let output: Array<DataVariableType> = [];
          for (let i = max; i >= min; i -= 1) {
            output.push(i);
          }
          return output;
        };
      } else {
        this._getTotalCount = () => this.values.length;
        this._getValues = () => {
          assertDataVariableArr(this.data, true);
          // Insert sorting here if needed
          return this.data;
        };
      }
    }
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
