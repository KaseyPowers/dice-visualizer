import type { DataVariableType, DataEntryType, DataRangeType } from "./types";

/** Simple Type checks */
export function isDataVariableType(input: unknown): input is DataVariableType {
  return typeof input === "number";
}

export function isDataRangeType(input: unknown): input is DataRangeType {
  return (
    !!input &&
    typeof input === "object" &&
    "min" in input &&
    isDataVariableType(input.min) &&
    "max" in input &&
    isDataVariableType(input.max)
  );
}

export function isDataEntryType(input: unknown): input is DataEntryType {
  return (
    !!input &&
    Array.isArray(input) &&
    input.length === 2 &&
    isDataVariableType(input[0]) &&
    typeof input[1] === "number"
  );
}

export function isDataVariableArr(
  input: unknown
): input is Array<DataVariableType> {
  return Array.isArray(input) && input.every((val) => isDataVariableType(val));
}

export function isDataEntryArr(input: unknown): input is Array<DataEntryType> {
  return Array.isArray(input) && input.every((val) => isDataEntryType(val));
}

/** Validating Type checks */

export function isValidDataEntryType(
  input: unknown,
  assert = false
): input is DataEntryType {
  const output = isDataEntryType(input) && input[1] >= 1;
  if (!output) {
    throw new Error("Expected a DataEntryType with count >= 1");
  }
  return output;
}

export function isValidVariableArr(
  input: unknown,
  assert = false
): input is Array<DataVariableType> {
  if (isDataVariableArr(input)) {
    if (input.length <= 0) {
      if (assert) {
        throw new Error("Empty array is not valid");
      }
      return false;
    }
    if (input.length !== new Set(input).size) {
      if (assert) {
        throw new Error("Expected the array to have unique values");
      }
      return false;
    }
    return true;
  } else if (assert) {
    throw new Error("Expected Input to be a DataVariableType array");
  } else {
    return false;
  }
}

export function isValidDataEntryArray(
  input: unknown,
  assert = false
): input is Array<DataEntryType> {
  if (
    Array.isArray(input) &&
    input.every((val) => isValidDataEntryType(val, assert))
  ) {
    if (input.length <= 0) {
      if (assert) {
        throw new Error("Empty array is not valid");
      }
      return false;
    }
    if (input.length !== new Set(input.map((val) => val[0])).size) {
      if (assert) {
        throw new Error("Expected the array to have unique values");
      }
      return false;
    }
    return true;
  } else if (assert) {
    throw new Error("Expected input to be an array of DataEntryType's");
  } else {
    return false;
  }
}
