/** Common data types between input and output/internal */

import { dice_gcd } from "./dice_gcd";

/** starting point as type, could later support strings too */
export type DataVariableType = number;
// Common generic for entry as a [value, count] tuple
export type EntryType<Value> = Value extends any
  ? [value: Value, count: number]
  : never;
// a variable and it's associated count
export type DataEntryType = [value: DataVariableType, count: number];

export function isDataVariableType(input: unknown): input is DataVariableType {
  return typeof input === "number";
}

export function isDataEntryType(input: unknown): input is DataEntryType {
  return (
    !!input &&
    Array.isArray(input) &&
    input.length === 2 &&
    isDataVariableType(input[0]) &&
    typeof input[1] === "number"
  );
}

// when adding two data items, this is the logic for how a pair of entries combines
// the combined value should add the DataEntry, and multiple the counts
function addEntries(a: DataEntryType, b: DataEntryType): DataEntryType {
  return [a[0] + b[0], a[1] * b[1]];
}

export abstract class DataItem {
  // the total number of values in this item.
  abstract get totalCount(): number;
  // get all value-count pairs of this data item
  abstract get entries(): ReadonlyArray<DataEntryType>;
  // return all values in this item
  abstract get values(): ReadonlyArray<DataVariableType>;
}

// a single variable
export class DataVariable extends DataItem {
  private readonly value: DataVariableType;
  // no validation needed, a single value always allowed
  constructor(input: DataVariableType) {
    super();
    this.value = input;
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
  private _entries?: DataEntryType[];
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
  constructor(input: DataVariableType[]) {
    super();
    if (new Set(input).size !== input.length) {
      throw new Error("Invalid array, expected each value to be unique");
    }
    this.data = input;
  }
  private _values?: DataVariableType[];
  get values(): readonly DataVariableType[] {
    if (!this._values) {
      const copy = [...this.data];
      copy.sort((a, b) => b - a);
      this._values = copy;
    }
    return this._values;
  }
}
// simplified array, just using the first + last value, assuming every integer between
export class DataRangeItem extends BaseDataArrayItem {
  private readonly max: number;
  private readonly min: number;
  constructor(input: number | [number, number]) {
    super();
    if (Array.isArray(input)) {
      if (input.length !== 2) {
        throw new Error("expected array input two be [min, max]");
      }
      this.min = input[0];
      this.max = input[1];
    } else {
      // default behavior from a single value
      this.min = 1;
      this.max = input;
    }
    // NOTE: we could have a different default min for a single value that's below 1?
    if (this.min > this.max) {
      throw new Error("invalid input, max needs to be greater than min");
    }
  }

  get totalCount() {
    // the range + 1 for length: ex. d4 (1..4) has 4 items, so 4-1+1
    return this.max - this.min + 1;
  }
  private _values?: DataVariableType[];
  get values(): readonly DataVariableType[] {
    if (!this._values) {
      this._values = [];
      // iterate through the range between min and max and add to the output array
      for (let i = this.min; i <= this.max; i += 1) {
        this._values.push(i);
      }
    }
    return this._values;
  }
}
// the default object for a dice, using a map to store the value + count
export class DataMapItem extends DataItem {
  private readonly data: Map<DataVariableType, number>;
  constructor(input: Map<DataVariableType, number> | Array<DataEntryType>) {
    super();
    let inputEntries: Array<DataEntryType>;
    if (input instanceof Map) {
      inputEntries = Array.from(input);
    } else if (Array.isArray(input)) {
      inputEntries = input;
    } else {
      throw new Error("Input not a map or array, expected one of the two");
    }
    if (inputEntries.length === 0) {
      throw new Error("Input as entries is empty");
    }
    const err = new Set<string>();
    let smallestCount: number | undefined;
    inputEntries.forEach((entry) => {
      if (!isDataEntryType(entry)) {
        err.add("Not a valid entry");
      } else if (entry[1] < 1) {
        err.add("Entries must have a value >= 1");
      } else if (
        typeof smallestCount === "undefined" ||
        entry[1] < smallestCount
      ) {
        // track smallest value for further validation
        smallestCount = entry[1];
      }
    });
    if (smallestCount === 1) {
      if (inputEntries.every((entry) => entry[1] === 1)) {
        err.add(
          "Every entry in object has count 1, this should be in an array type instead"
        );
      }
    } else {
      if (inputEntries.every((entry) => entry[1] % smallestCount! === 0)) {
        err.add(
          `Every entry has a count divisible by the smallest count ${smallestCount}, expect this to be simplified before creating the DataItem`
        );
      }
    }

    if (err.size > 0) {
      throw new Error(`Invalid Input: ${Array.from(err).join("\n")}`);
    }

    this.data = new Map(input);
  }
  // entries as starting point, will still memoize the Array.from to sort it
  private _entries?: DataEntryType[];
  get entries(): readonly DataEntryType[] {
    if (!this._entries) {
      const asArray = Array.from(this.data);
      asArray.sort((a, b) => b[0] - a[0]);
      this._entries = asArray;
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

// working with potentially imperfect input entries
function getFromDataEntries(input: DataEntryType[]): DataItem {
  // if only one, can still jump straight to data variable
  if (input.length === 1) {
    return new DataVariable(input[0][0]);
  }

  let allValues = input.map((entry) => entry[0]);

  // check if the values are unique, if not, need to condense the values and go again
  if (new Set(allValues).size !== input.length) {
    // add each entry to the map to get the total counts
    const asMap = new Map<DataVariableType, number>();
    input.forEach((entry) => {
      asMap.set(entry[0], (entry[0] ?? 0) + entry[1]);
    });
    // call recursively with the combined values
    return getFromDataEntries(Array.from(asMap));
  }

  // if every input has the same count, than this would be valid as an array
  if (input.every((entry) => entry[1] === input[0][1])) {
    // Could optomize these to be done at the same time but start simpler
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    // if the range between min and max (with unique values) equals the input.length, then the entries can be stored as a range.
    if (max - min + 1 === input.length) {
      return new DataRangeItem([min, max]);
    }
    // if not range, regular array
    return new DataArrayItem(allValues);
  }

  // if not a valid array, need to make sure to simplify the counts if possible before creating the object
  const gcd = dice_gcd(input.map((entry) => entry[1]));
  return new DataMapItem(
    gcd > 1 ? input.map(([val, count]) => [val, count / gcd]) : input
  );
}

function condenseDataEntries(
  input: EntryType<DataVariableType | DataItem>[]
): DataEntryType[] {
  const output: DataEntryType[] = [];
  const itemInputs: EntryType<DataItem>[] = [];

  input.forEach((entry) => {
    if (isDataEntryType(entry)) {
      output.push(entry);
    } else if (entry[0] instanceof DataVariable) {
      output.push([
        // if data variable, get the value(s), which should be an array with that one value
        entry[0].values[0],
        entry[1],
      ]);
    } else {
      itemInputs.push(entry);
    }
  });

  let next: undefined | EntryType<DataItem>;
  while ((next = itemInputs.shift())) {
    const [item, count] = next;
    const itemTotal = item.totalCount;
    const itemEntries = item.entries;
    /**
     * to mix a larger item into the entries of the next item:
     * To keep the ratio of the rest:
     * - new total count: outer total * itemTotal
     * - new entry count = (previous count / outer total) * new total
     *    - new entry count = (previous count / outer total) * (outer total * itemTotal)
     *    - new entry count = previous count * itemTotal
     *
     * So do this to the counts of all other entries
     * for this itemsEntries, make sure to multiply the counts by the outer count
     */
    if (itemTotal > 1) {
      output.forEach((entry) => {
        entry[1] = entry[1] * itemTotal;
      });
      itemInputs.forEach((entry) => {
        entry[1] = entry[1] * itemTotal;
      });
    }
    itemEntries.forEach((entry) => {
      output.push([entry[0], entry[1] * count]);
    });
  }
  return output;
}

// Function to take the raw input, and turn it into the best fit DataItem
// export function getDataItem(): DataItem {}
