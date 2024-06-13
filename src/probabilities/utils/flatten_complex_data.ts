import { DataItem } from "../data_item";
import {
  DataEntryType,
  DataVariableType,
  EntryType,
  isDataEntryArr,
  isDataEntryType,
  isDataVariableArr,
  isDataVariableType,
} from "../types";

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

// This math will just flatten an array of complex data
type ComplexBaseType =
  | DataVariableType
  | DataItem
  | DataEntryType
  | Array<DataVariableType>
  | Array<DataEntryType>;
type ComplexEntryType = EntryType<ComplexBaseType>;
type ComplexInputType = ComplexBaseType | ComplexEntryType;

// Assume the data has been converted to entries, simplify flatten the results, let the caller condense/simplify as needed
export function flattenComplexEntries(
  input: Array<ComplexInputType>
): DataEntryType[] {
  const output: DataEntryType[] = [];
  let acc = 1;

  input.forEach((part) => {
    let count: number;
    let innerCount: number;
    let innerEntries: ReadonlyArray<DataEntryType>;
    let item: ComplexBaseType;
    if (
      isDataVariableType(part) ||
      part instanceof DataItem ||
      isDataEntryArr(part)
    ) {
      count = 1;
      item = part;
    } else {
      item = part[0];
      count = part[1];
    }
    if (count < 1) {
      throw new Error("Expected count >= 1");
    }
    // data variable means it's already an entry so can add as is
    if (isDataVariableType(item)) {
      innerCount = 1;
      innerEntries = [[item, 1]];
    } else if (isDataEntryType(item)) {
      innerEntries = [item];
      // just grab the count from entry
      innerCount = item[1];
    } else if (isDataVariableArr(item)) {
      innerCount = item.length;
      innerEntries = item.map((val) => [val, 1]);
    } else if (item instanceof DataItem) {
      innerEntries = item.entries;
      innerCount = item.totalCount;
    } else {
      innerEntries = item;
      innerCount = item.reduce((total, entry) => total + entry[1], 0);
    }
    if (innerCount < 1) {
      throw new Error("Expected a count >= 1");
    }

    const currentAcc = acc;
    // Now the innerCount + innerEntries is set, use
    if (innerCount > 1) {
      output.forEach((entry) => {
        entry[1] *= innerCount;
      });
      acc *= innerCount;
    }
    innerEntries.forEach((entry) => {
      output.push([entry[0], entry[1] * count * currentAcc]);
    });
  });

  return output;
}
