import type { DataVariable, DataObj, DataEntry } from "./data_item";

export function isDataVariable(input: unknown): input is DataVariable {
  return typeof input === "number";
}

export function isDataEntry(input: unknown): input is DataEntry {
  return (
    !!input &&
    Array.isArray(input) &&
    input.length === 2 &&
    isDataVariable(input[0]) &&
    typeof input[1] === "number"
  );
}

export function isDataObj(input: unknown, deepCheck = false): input is DataObj {
  if (input instanceof Map) {
    // optional deep check for early validation, will get all entries of the map, and verify that all keys are dataVariables (using function, in case that type changes over time, and all values are a number/count)
    if (deepCheck) {
      return Array.from(input).every((entry) => isDataEntry(entry));
    }
    return true;
  }
  return false;
}
