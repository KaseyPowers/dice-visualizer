import type { DataRangeType } from "./types";

// define in one spot the way to get the total/size/length from a range type
export function dataRangeTotal(input: DataRangeType): number {
  return input.max - input.min + 1;
}
