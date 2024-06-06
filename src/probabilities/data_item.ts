import { isDataVariable, isDataEntry, isDataObj } from "./type_checks";

/** Common data types between input and output/internal */
/** starting point as type, could later support strings too */
export type DataVariable = number;
/** Used to represent a variable and count */
export type DataEntry = [DataVariable, number];
// map type of the entries above, useful for the simple inputs and used internally by the DataItem class
export type DataObj = Map<DataVariable, number>;

export type BaseDataItemInput =
  | DataVariable
  | Array<DataVariable | DataEntry>
  | DataObj;
export type DataItemInput = DataItem | BaseDataItemInput;
type DataStorageTypes = DataVariable | Array<DataVariable> | DataObj;

export class DataItem {
  // data is stored as a single value, the object, or an array of other data items. single value is allowed just to avoid the slight overhead increase of using an object for just one value
  private readonly data: DataStorageTypes;

  static validateData(
    input: DataStorageTypes | undefined
  ): input is DataStorageTypes {
    if (typeof input === "undefined") {
      throw new Error("Input can not be undefined");
    } else if (Array.isArray(input)) {
      if (input.length < 1) {
        throw new Error("Empty array isn't valid");
      }
      if (input.length === 1) {
        throw new Error("An array with one value should be a variable");
      }
      // make sure that all values are unique
      if (new Set(input).size !== input.length) {
        throw new Error(
          "Unique set of input is not the same size as the array, expect that there are no duplicates"
        );
      }
      return true;
    } else if (input instanceof Map) {
      // make sure it's valid
      if (!isDataObj(input, true)) {
        throw new Error("Input is object but not a deeply-valid data object");
      }

      const vals = Array.from(input.values());
      if (vals.some((val) => val < 1)) {
        throw new Error("Map has values less than 1, that is invalid");
      }
      if (vals.every((val) => val === 1)) {
        throw new Error("Every value in object is 1, this should be an array");
      }
      return true;
    } else if (isDataVariable(input)) {
      return true;
    }
    throw new Error("Data must be a variable, array of variables, or a map");
  }

  static isDataItemInput(input: unknown): input is DataItemInput {
    return (
      isDataVariable(input) ||
      input instanceof DataItem ||
      input instanceof Map ||
      (Array.isArray(input) &&
        input.every((part) => isDataEntry(part) || isDataVariable(part)))
    );
  }

  // this will combine counts, so two DataItems will be merged, don't expect this to work as addition
  //   static parseItemData(
  //     input: DataItemInput | Array<DataItemInput>,
  //     base: DataStorageTypes
  //   ): DataStorageTypes;
  //   static parseItemData(
  //     input: DataItemInput | Array<DataItemInput>,
  //     base?: undefined | DataStorageTypes
  //   ): undefined | DataStorageTypes;
  static parseItemData(
    input: DataItemInput | Array<DataItemInput>,
    base?: undefined | DataStorageTypes
  ): undefined | DataStorageTypes {
    // convert to entity and call agains
    if (isDataVariable(input)) {
      return DataItem.parseItemData([input, 1], base);
    }
    if (input instanceof DataItem) {
      return DataItem.parseItemData(input.data, base);
    }
    if (input instanceof Map) {
      if (typeof base === "undefined") {
        return input;
      }
      return Array.from(input).reduce<undefined | DataStorageTypes>(
        (output, part) => DataItem.parseItemData(part, output),
        base
      );
    }
    if (isDataEntry(input)) {
      const [val, count] = input;
      if (count < 0) {
        throw new Error("Not expecting negative counts in entry");
      } else if (count === 0) {
        // skip 0's
        return base;
      } else if (count === 1) {
        if (typeof base === "undefined") {
          return val;
        } else if (Array.isArray(base) && !base.includes(val)) {
          return [...base, val];
        }
      }
      // output variable to build out
      let output = base;
      // if hitting this point, we need output to be a map
      if (typeof output === "undefined") {
        output = new Map();
      } else if (isDataVariable(output)) {
        output = new Map([[output, 1]]);
      } else if (Array.isArray(output)) {
        output = new Map(output.map((val) => [val, 1]));
      } else if (!(output instanceof Map)) {
        throw new Error("Unexpected type for output");
      }
      output.set(val, (output.get(val) ?? 0) + count);
      return output;
    }

    if (Array.isArray(input)) {
      return input.reduce(
        (output, part) => DataItem.parseItemData(part, output),
        base
      );
    }

    throw new Error("Invalid/unexpected Input type");
  }

  // TODO: Parsing inputs, figure out best pattern for this, if we want special syntax for creating from certain inputs.
  constructor(input: DataItemInput) {
    const data = DataItem.parseItemData(input);
    // validate the data, will throw an error for invalid
    if (DataItem.validateData(data)) {
      this.data = data;
      // if input is a data item, attempt copying over memoization results since they should also match
      if (input instanceof DataItem) {
        this._entries = input._entries?.map((part) => [...part]);
        this._values = input._values ? [...input._values] : undefined;
      }
    } else {
      throw new Error(
        "DataItem constructor- This error message shouldn't be called"
      );
    }
  }
  // store the results of getting the values, to avoid duplicate logic
  private _entries?: Array<DataEntry>;
  get entries(): ReadonlyArray<DataEntry> {
    if (!this._entries) {
      // variable is just a single item, so can set it right away
      if (isDataVariable(this.data)) {
        this._entries = [[this.data, 1]];
      } else if (Array.isArray(this.data)) {
        // if data is an array, values will return the sorted version, so wel just need to map it to an entry of count 1
        this._entries = this.values.map<DataEntry>((val) => [val, 1]);
      } else {
        // Maps are easy to get the entries array from, so do that then sort the entries
        const asArray = Array.from(this.data);
        // sort the largest value first in the array
        asArray.sort((a, b) => b[0] - a[0]);
        this._entries = asArray;
      }
    }
    return this._entries;
  }

  private _total?: number;
  get totalCount() {
    if (typeof this._total === "undefined") {
      if (isDataVariable(this.data)) {
        this._total = 1;
      } else if (Array.isArray(this.data)) {
        this._total = this.data.length;
      } else {
        this._total = this.entries.reduce(
          (output, entry) => output + entry[1],
          0
        );
      }
    }
    return this._total;
  }
  // get an array of just the potential values, aka, the first value of each DataEntry
  private _values?: Array<DataVariable>;
  get values(): ReadonlyArray<DataVariable> {
    if (!this._values) {
      if (isDataVariable(this.data)) {
        // data variable can be returned without much work, also doesn't need to involve the entries
        this._values = [this.data];
      } else if (Array.isArray(this.data)) {
        // an array just needs to be sorted.
        const copy = [...this.data];
        copy.sort((a, b) => b - a);
        this._values = copy;
      } else {
        // data objects should just use the entries logic and map it down to the first value of each
        this._values = this.entries.map((entry) => entry[0]);
      }
    }
    // the entries get is memoized for us, so this should be fine, but I'll add that step anyway just in case of large objects?
    return this._values;
  }
  // if this object can be used as a variable
  canBeVariable(): boolean {
    return isDataVariable(this.data);
  }
  toDataVariable(): DataVariable {
    // canBeVariable is just a isDataVariable check, but need to cast here. Other option would be do the same check but in case we change logic up later this seems like the better choice
    if (this.canBeVariable()) {
      return this.data as DataVariable;
    } else {
      throw new Error(
        "Can't call this on a DataItem with canBeVariable() = false"
      );
    }
  }
}

export type DataCollectionInput = DataCollection | Array<DataItemInput>;
export class DataCollection {
  private readonly data: Array<DataItem>;

  static isDataCollectionInput(input: unknown): input is DataCollectionInput {
    return (
      input instanceof DataCollection ||
      (Array.isArray(input) &&
        input.every((part) => DataItem.isDataItemInput(part)))
    );
  }

  constructor(input: DataCollectionInput) {
    this.data = (input instanceof DataCollection ? input.data : input).map(
      (inputPart) => new DataItem(inputPart)
    );
  }

  // Convert collection to a data item by getting the sum
  toDataItem(): DataItem {
    // TODO: Sum logic
    return this.data[0];
  }
}

export type DataInputTypes = DataCollectionInput | DataItemInput;

export function getDataClass(
  input: DataInputTypes,
  defaultCollection: boolean = false
): DataItem | DataCollection {
  if (defaultCollection && DataCollection.isDataCollectionInput(input)) {
    return new DataCollection(input);
  } else if (DataItem.isDataItemInput(input)) {
    return new DataItem(input);
  } else if (DataCollection.isDataCollectionInput(input)) {
    return new DataCollection(input);
  } else {
    throw new Error("input didn't work as either input type somehow");
  }
}
