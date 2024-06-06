/** Base value type as number, but could potentially support strings later?  */
type DataVariable = number;
/** Main way we store a set of variables, with a count associated with each one */
type DataObj = Map<DataVariable, number>;
/** Tuple for representing a single value-count combo used above */
type DataEntry = [DataVariable, number];
/** Combination of above */
type BaseData = DataVariable | DataObj;

/** Piece of a collection, a single value or a count of a value. ex. 2d4 -> [2, d4],  */
// type CollectionItem = BaseData | [number, BaseData];
/** Collection is  */

function isDataVariable(input: unknown): input is DataVariable {
  return typeof input === "number";
}
function isDataObj(input: unknown, deepCheck = false): input is DataObj {
  if (input instanceof Map) {
    // optional deep check for early validation, will get all entries of the map, and verify that all keys are dataVariables (using function, in case that type changes over time, and all values are a number/count)
    if (deepCheck) {
      return Array.from(input).every(
        ([key, value]) => isDataVariable(key) && typeof value === "number"
      );
    }
    return true;
  }
  return false;
}

type TypeIsFlag<Input, Type> = Input extends Type
  ? Type extends Input
    ? true
    : false
  : false;

type DataCollection = Array<DataItem>;
type AllDataTypes = BaseData | DataCollection;
// Default base data for simplicity
class DataItem {
  // data is stored as a single value, the object, or an array of other data items. single value is allowed just to avoid the slight overhead increase of using an object for just one value
  private readonly data: BaseData;
  // TODO: Parsing inputs, figure out best pattern for this, if we want special syntax for creating from certain inputs.
  constructor(input: BaseData) {
    this.data = input;
  }
  // store the results of getting the values, to avoid duplicate logic
  private _entries?: Array<DataEntry>;
  get entries(): ReadonlyArray<DataEntry> {
    if (!this._entries) {
      // single variable to an entry doesn't require extra logic
      if (isDataVariable(this.data)) {
        this._entries = [[this.data, 1]];
      } else {
        // get array, but then we want to sort it
        const asArr = Array.from(this.data);
        // sort the largest value first in the array
        asArr.sort((a, b) => b[0] - a[0]);
        this._entries = asArr;
      }
    }
    return this._entries;
  }
  // get an array of just the potential values, aka, the first value of each DataEntry
  get values(): ReadonlyArray<DataVariable> {
    // the entries get is memoized for us, so this should be fine, but I'll add that step anyway just in case of large objects?
    return this.entries.map((entry) => entry[0]);
  }
}
