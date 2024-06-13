/** Util types at the top, will move to another file if needed */
export type MaybeArray<T> = T | Array<T>;
// Common generic for entry as a [value, count] tuple
export type EntryType<Value> = Value extends any
  ? [value: Value, count: number]
  : never;

/** starting point as type, could later support strings too */
export type DataVariableType = number;

// a variable and it's associated count
export type DataEntryType = EntryType<DataVariableType>;

// technically the same as an entry right now, but useful in case we change the variable type
export type DataRangeType = { min: DataVariableType; max: DataVariableType };

export type DataItemDataTypes =
  | DataRangeType
  | Array<DataVariableType>
  | Array<DataEntryType>;
