import type {
  ChartOptions,
  DataItem,
  RangeType,
  SeriesOptions,
  SeriesData,
} from "./types";

export function isRangeType(input: unknown): input is RangeType {
  return (
    Array.isArray(input) &&
    input.length === 2 &&
    input.every((v) => typeof v === "number")
  );
}
export function isValidRangeType(input: unknown): input is RangeType {
  return isRangeType(input) && input[0] <= input[1];
}

function mergeRanges(keepSmaller: boolean, ...values: RangeType[]): RangeType {
  if (values.length < 1) {
    throw new Error("Invalid input");
  }
  let [min, max] = values[0];
  for (let i = 1; i < values.length; i++) {}
  return values.slice(1).reduce<RangeType>((output, next) => {
    if (keepSmaller) {
      if (next[0] > output[0]) {
        output[0] = next[0];
      }
      if (next[1] < output[1]) {
        output[1] = next[1];
      }
    } else {
      if (next[0] < output[0]) {
        output[0] = next[0];
      }
      if (next[1] < output[1]) {
        output[1] = next[1];
      }
    }
    return output;
  }, values[0]);
}

export function keepSmallerRange(...values: RangeType[]): RangeType {
  return mergeRanges(true, ...values);
}
export function keepLargerRange(...values: RangeType[]): RangeType {
  return mergeRanges(false, ...values);
}

export function percentStrings(val: number | null) {
  let str = "_";
  if (typeof val === "number") {
    if (Number.isInteger(val)) {
      str = val.toString();
    } else {
      str = val.toFixed(2);
    }
  }
  return str + "%";
}
