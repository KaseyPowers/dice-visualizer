import {
  CondensableEntry,
  condenseDataEntries,
} from "./utils/condense_entries";
import { minimizeEntries } from "./utils/minimize_entries";
import {
  isDataRangeType,
  isDataVariableArr,
  isDataVariableType,
  isValidDataEntryArray,
  isValidVariableArr,
} from "./utils/type_checks";
import { DataVariableType, DataEntryType, DataRangeType } from "./utils/types";
import { dataRangeTotal } from "./utils/utilities";

export abstract class DataItem {
  // the total number of values in this item.
  abstract get totalCount(): number;
  // NOTE: Expect entries/values to be sorted in descending order
  // get all value-count pairs of this data item
  abstract get entries(): ReadonlyArray<DataEntryType>;
  // return all values in this item
  abstract get values(): ReadonlyArray<DataVariableType>;
}

// a single variable
export class DataVariable extends DataItem {
  readonly value: DataVariableType;

  static isValidInput(
    input: unknown,
    assert = false
  ): input is DataVariableType {
    const output = isDataVariableType(input);
    if (assert && !output) {
      throw new Error("Input expected a DataVariableType");
    }
    return output;
  }
  // no validation needed, a single value always allowed
  constructor(input: DataVariableType) {
    super();
    DataVariable.isValidInput(input, true);
    this.value = input;
  }
  copy() {
    return new DataVariable(this.value);
  }
  get totalCount(): number {
    return 1;
  }
  get entries(): readonly DataEntryType[] {
    return [[this.value, 1]];
  }
  get values(): readonly DataVariableType[] {
    return [this.value];
  }
}

// array based dice will define their values and derive the other getters from that
abstract class BaseDataArrayItem extends DataItem {
  get totalCount() {
    return this.values.length;
  }
  protected _entries?: DataEntryType[];
  get entries(): readonly DataEntryType[] {
    if (!this._entries) {
      this._entries = this.values.map((val) => [val, 1]);
    }
    return this._entries;
  }
}
// standard array, expect unique values, otherwise no restrictions
export class DataArrayItem extends BaseDataArrayItem {
  private readonly data: DataVariableType[];
  static isValidInput(
    input: unknown,
    assert = false
  ): input is Array<DataVariableType> {
    return isValidVariableArr(input, assert);
  }
  constructor(input: Array<DataVariableType>) {
    super();
    DataArrayItem.isValidInput(input, true);
    // just storing this as values
    this.data = input;
  }
  copy() {
    const output = new DataArrayItem(this.data);
    output._entries = this._entries;
    output._values = this._values;
    return output;
  }
  private _values?: DataVariableType[];
  get values(): readonly DataVariableType[] {
    if (!this._values) {
      this._values = this.data.toSorted((a, b) => b - a);
    }
    return this._values;
  }
}
// simplified array, just using the first + last value, assuming every integer between
export class DataRangeItem extends BaseDataArrayItem {
  private readonly range: DataRangeType;
  static isValidInput(input: unknown, assert = false): boolean {
    if (isDataVariableType(input)) {
      if (input < 1) {
        if (assert) {
          throw new Error(
            "A single varialbe expects 1..<input>, so input should be >= 1"
          );
        }
        return false;
      }
      return true;
    }
    if (isDataRangeType(input)) {
      if (input.max < input.min) {
        if (assert) {
          throw new Error("Expect range obj to have max >= min");
        }
        return false;
      }
      return true;
    }
    if (Array.isArray(input)) {
      if (input.length !== 2) {
        if (assert) {
          throw new Error("expected array input two be [min, max]");
        }
        return false;
      }
      if (input.some((val) => !isDataVariableType(val))) {
        if (assert) {
          throw new Error("Expected [min, max] to both be data variables");
        }
        return false;
      }
      if (input[0] > input[1]) {
        if (assert) {
          throw new Error(
            "Expect range to be given as [min, max] but min > max"
          );
        }
        return false;
      }
      return true;
    }
    if (assert) {
      throw new Error("Input is not a variable or [min, max]");
    }
    return false;
  }
  constructor(input: number | [number, number] | DataRangeType) {
    super();
    DataRangeItem.isValidInput(input, true);
    if (isDataRangeType(input)) {
      this.range = input;
    } else if (Array.isArray(input)) {
      this.range = { min: input[0], max: input[1] };
    } else {
      this.range = { min: 1, max: input };
    }
  }
  copy() {
    const output = new DataRangeItem(this.range);
    output._entries = this._entries;
    output._values = this._values;
    return output;
  }

  get totalCount() {
    // the range + 1 for length: ex. d4 (1..4) has 4 items, so 4-1+1
    return dataRangeTotal(this.range);
  }
  private _values?: DataVariableType[];
  get values(): readonly DataVariableType[] {
    if (!this._values) {
      this._values = [];
      // iterate through the range between min and max and add to the output array
      for (let i = this.range.max; i >= this.range.min; i += 1) {
        this._values.push(i);
      }
    }
    return this._values;
  }
}
// the default object for a dice, using a map to store the value + count
export class DataSetItem extends DataItem {
  private readonly data: Array<DataEntryType>;
  static isValidInput(
    input: unknown,
    assert = false
  ): input is Array<DataEntryType> | Map<DataVariableType, number> {
    // if map, convert to arrays, then check
    const toCheck = input instanceof Map ? Array.from(input) : input;
    // This just checks if the format is valid, not if the input would be better used for a more specific class
    return isValidDataEntryArray(toCheck, assert);
  }
  constructor(input: Map<DataVariableType, number> | Array<DataEntryType>) {
    super();
    // getting the entries array before validating, to avoid doing the onversion in both places
    const data = input instanceof Map ? Array.from(input) : input;
    DataSetItem.isValidInput(data, true);
    this.data = data;
  }
  copy() {
    const output = new DataSetItem(this.data);
    output._entries = this._entries;
    output._values = this._values;
    return output;
  }
  // entries as starting point, will still memoize the Array.from to sort it
  private _entries?: DataEntryType[];
  get entries(): readonly DataEntryType[] {
    if (!this._entries) {
      this._entries = this.data.toSorted((a, b) => b[0] - a[0]);
    }
    return this._entries;
  }
  private _values?: DataVariableType[];
  get values(): readonly DataVariableType[] {
    if (!this._values) {
      this._values = this.entries.map((entry) => entry[0]);
    }
    return this._values;
  }
  private _totalCount?: number;
  get totalCount(): number {
    if (typeof this._totalCount === "undefined") {
      this._totalCount = this.entries.reduce(
        (output, entry) => output + entry[1],
        0
      );
    }
    return this._totalCount;
  }
}

// Once we have an array of condensable entries, can minimize+reduce
function toDataItem(input: Array<CondensableEntry>): DataItem {
  const condensedEntries = condenseDataEntries(input);
  const data = minimizeEntries(condensedEntries);
  if (isDataVariableType(data)) {
    return new DataVariable(data);
  }
  if ("min" in data) {
    return new DataRangeItem([data.min, data.max]);
  }
  // If an array of variables, is either an array or a range
  // NOTE: this output will always return ranges with [min, max] never the single digit parameter style
  if (isDataVariableArr(data)) {
    return new DataArrayItem(data);
  }
  return new DataSetItem(data);
}
// TODO: keep improving this as we go.
// type BaseInputTypes = CondensableEntry;
// export function getDataItem(input: MaybeArray<BaseInputTypes>): DataItem {

// }
