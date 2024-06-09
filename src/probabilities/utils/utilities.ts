import { DataRangeType, DataEntryType } from "./types";

// define in one spot the way to get the total/size/length from a range type
export function dataRangeTotal(input: DataRangeType): number {
  return input.max - input.min + 1;
}

// when adding two data items, this is the logic for how a pair of entries combines
// the combined value should add the DataEntry, and multiple the counts
function addEntries(a: DataEntryType, b: DataEntryType): DataEntryType {
  return [a[0] + b[0], a[1] * b[1]];
}
