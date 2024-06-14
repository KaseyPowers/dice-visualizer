import type { DataEntryType } from "../types";
import { isDataEntryArr, isDataVariableType } from "../types";

import type { DataItemTypeEntry } from "../classes";
import { Collection, isDataItemTypeEntry } from "../classes";

export function isDataItemTypeEntryArr(
  input: unknown
): input is Array<DataItemTypeEntry> {
  return Array.isArray(input) && input.every((val) => isDataItemTypeEntry(val));
}

export function flattenDataItemEntries(
  input: Array<DataItemTypeEntry>
): Array<DataEntryType> {
  const output: DataEntryType[] = [];
  // store the total multiplier for remaining inputs
  let mult = 1;

  input.forEach((inputVal) => {
    let [item, count] = inputVal;
    if (count < 1) {
      throw new Error("Expected count >= 1");
    }
    if (item instanceof Collection) {
      item = item.toSingleItem();
    }
    let innerCount: number;
    let innerEntries: ReadonlyArray<DataEntryType>;
    if (isDataVariableType(item)) {
      innerCount = 1;
      innerEntries = [[item, 1]];
    } else {
      innerEntries = item.entries;
      innerCount = item.totalCount;
    }
    if (innerCount < 1) {
      throw new Error("Expected a count >= 1");
    }

    const currentMultiplier = mult;
    // Now the innerCount + innerEntries is set, use
    if (innerCount > 1) {
      output.forEach((entry) => {
        entry[1] *= innerCount;
      });
      mult *= innerCount;
    }
    innerEntries.forEach((entry) => {
      output.push([entry[0], entry[1] * count * currentMultiplier]);
    });
  });

  return output;
}

// checks if the right type before doing main logic. Since Array<DataEntryType> would also count as the input type
export function flattenIfNeeded(
  input: Array<DataItemTypeEntry>
): Array<DataEntryType> {
  // already an entry array, return
  if (isDataEntryArr(input)) {
    return input;
  }
  return flattenDataItemEntries(input);
}
