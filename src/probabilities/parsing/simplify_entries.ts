import type { DataVariableType, DataEntryType, DataRangeType } from "../types";
import { dataRangeTotal } from "../types";

import { minimizeEntryCounts, toUniqueVars } from "../utils";

// parse a set of entries into it's most simple data types
export function simplifyEntries(input: Array<DataEntryType>) {
  // make sure they are unique
  const values = toUniqueVars(input);
  if (values.length === 1) {
    return values[0][0];
  }

  // range is initially just for the first index
  const range: DataRangeType = { min: values[0][0], max: values[0][0] };
  const asArray: Array<DataVariableType> = [];
  const validAsArray = values.every((entry, index, arr) => {
    // compare entryies count to the previous one, valid if all entries counts are equal
    if (index > 0 && entry[1] !== arr[index - 1][1]) {
      return false;
    }
    asArray.push(entry[0]);
    if (entry[0] < range.min) {
      range.min = entry[0];
    }
    if (entry[0] > range.max) {
      range.max = entry[0];
    }
    return true;
  });

  if (validAsArray) {
    if (asArray.length !== values.length) {
      throw new Error(
        "Something wrong, the asArray array should have the same length as values"
      );
    }
    // range is valid if the total from range is same as length of inputs
    if (asArray.length === dataRangeTotal(range)) {
      return range;
    }
    return asArray;
  }
  // do the minimized count logic only on entries
  return minimizeEntryCounts(values);
}
