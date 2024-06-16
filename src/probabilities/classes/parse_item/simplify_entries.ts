import type {
  DataVariableType,
  DataEntryType,
  DataRangeType,
} from "@/probabilities/types";
import type { Dice, DiceInputTypes } from "../dice";
import { dataRangeTotal } from "@/probabilities/types";

import { toUniqueVarEntries } from "./unique_vars";
import { minimizeEntryCounts } from "./dice_gcd";

// use when we know the values are unique already.
export function simplifyUniqueEntries(
  values: DataEntryType[]
): Exclude<DiceInputTypes, Dice> {
  // if single value, return it
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

// take inputs, and make sure they are unique before simplifying
export function simplifyEntries(
  input: Array<DataVariableType | DataEntryType>
) {
  return simplifyUniqueEntries(toUniqueVarEntries(input));
}
