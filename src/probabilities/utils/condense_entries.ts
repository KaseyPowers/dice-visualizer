import { EntryType, DataVariableType, DataEntryType } from "./types";
import { DataItem, DataVariable } from "../data_items";
import { isDataEntryType } from "./type_checks";

export type CondensableEntry = EntryType<
  DataItem | DataVariableType | DataEntryType
>;
// Just condenses the input down into an array of entries, further simplification will be needed before use ( in minimize_entries file)
export function condenseDataEntries(
  input: Array<CondensableEntry>
): DataEntryType[] {
  const output: DataEntryType[] = [];
  const toAdd: Array<Exclude<CondensableEntry, DataEntryType>> = [];
  // seperate all data entries into output, to then parse the deepr values on their own
  input.forEach((part) => {
    if (isDataEntryType(part)) {
      output.push(part);
    } else if (part[0] instanceof DataVariable) {
      output.push([part[0].value, part[1]]);
    } else {
      toAdd.push(part);
    }
  });

  let next: undefined | (typeof toAdd)[number];
  while ((next = toAdd.shift())) {
    const [variable, count] = next;
    let itemTotal: number;
    let itemEntries: ReadonlyArray<DataEntryType>;
    if (variable instanceof DataItem) {
      itemTotal = variable.totalCount;
      itemEntries = variable.entries;
    } else {
      itemEntries = [variable];
      itemTotal = variable[1];
    }

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
    // if itemTotal is one, multiplying values by one won't change them so this step can be skipped
    if (itemTotal > 1) {
      output.forEach((entry) => {
        entry[1] = entry[1] * itemTotal;
      });
      toAdd.forEach((entry) => {
        entry[1] = entry[1] * itemTotal;
      });
    }
    // take this items entries, and multiple their count by the item's count as we add to output
    itemEntries.forEach((entry) => {
      output.push([entry[0], entry[1] * count]);
    });
  }

  return output;
}
