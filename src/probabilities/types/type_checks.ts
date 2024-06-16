import { TypeCheckFn } from "@/utils/types";
import type {
  DataVariableType,
  DataEntryType,
  DataRangeType,
  EntryType,
} from "./types";

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

export function isEntryType<T = unknown>(
  input: unknown,
  fn: TypeCheckFn<T>
): input is EntryType<T> {
  return (
    !!input &&
    Array.isArray(input) &&
    input.length === 2 &&
    typeof input[1] === "number" &&
    fn(input[0])
  );
}

export function isDataEntryType(input: unknown): input is DataEntryType {
  return isEntryType(input, isDataVariableType);
}

export function isDataVariableArr(
  input: unknown
): input is Array<DataVariableType> {
  return Array.isArray(input) && input.every((val) => isDataVariableType(val));
}

export function isEntryArr<T = unknown>(
  input: unknown,
  fn: TypeCheckFn<T>
): input is Array<EntryType<T>> {
  return Array.isArray(input) && input.every((val) => isEntryType(val, fn));
}

export function isDataEntryArr(input: unknown): input is Array<DataEntryType> {
  return Array.isArray(input) && input.every((val) => isDataEntryType(val));
}

/** Validate Known Types */
export function entryIsValid(
  input: EntryType<unknown>,
  assert = false
): boolean {
  if (input[1] < 1) {
    if (assert) {
      throw new Error("Expected entry to have a count >= 1");
    }
    return false;
  }
  return true;
}

export function dataRangeIsValid(
  input: DataRangeType,
  assert = false
): boolean {
  if (input.min > input.max) {
    if (assert) {
      throw new Error("Expected range max to be greater than or equal to min");
    }
    return false;
  }
  return true;
}

export function dataVariableArrIsValid(
  input: Array<DataVariableType>,
  assert = false
): boolean {
  if (input.length <= 0) {
    if (assert) {
      throw new Error("Empty array is not valid");
    }
    return false;
  }
  // skip this check if length is 1, since the set will always have the same size
  if (input.length > 1 && input.length !== new Set(input).size) {
    if (assert) {
      throw new Error("Expected the array to have unique values");
    }
    return false;
  }
  return true;
}

export function entryArrIsValid(
  input: Array<EntryType<unknown>>,
  assert = false
): boolean {
  if (input.length <= 0) {
    if (assert) {
      throw new Error("Empty array is not valid");
    }
    return false;
  }
  if (input.some((entry) => !entryIsValid(entry))) {
    if (assert) {
      throw new Error("Expected every entry to be valid");
    }
    return false;
  }
  return true;
}

export function dataEntryArrIsValid(
  input: Array<DataEntryType>,
  assert = false
): boolean {
  // fn handles assert part of logic, return
  if (!entryArrIsValid(input, assert)) {
    return false;
  }
  if (input.length !== new Set(input.map((val) => val[0])).size) {
    if (assert) {
      throw new Error("Expected the array to have unique values");
    }
    return false;
  }
  return true;
}

/** Validate If Type Checks */
// These types will only throw errors when asserting if they are that type, otherwise will still return false
export function isValidDataEntryType(
  input: unknown,
  assert = false
): input is DataEntryType {
  return isDataEntryType(input) && entryIsValid(input, assert);
}
export function isValidDataRangeType(
  input: unknown,
  assert = false
): input is DataRangeType {
  return isDataRangeType(input) && dataRangeIsValid(input, assert);
}
export function isValidDataVariableArr(
  input: unknown,
  assert = false
): input is Array<DataVariableType> {
  return isDataVariableArr(input) && dataVariableArrIsValid(input, assert);
}

export function isValidEntryArr<T = unknown>(
  input: unknown,
  fn: TypeCheckFn<T>,
  assert = false
): input is Array<EntryType<T>> {
  return isEntryArr(input, fn) && entryArrIsValid(input, assert);
}

export function isValidDataEntryArr(
  input: unknown,
  assert = false
): input is Array<DataEntryType> {
  return isDataEntryArr(input) && dataEntryArrIsValid(input, assert);
}

/** Assert Types */
export function assertDataVariableType(
  input: unknown
): asserts input is DataVariableType {
  if (!isDataVariableType(input)) {
    throw new Error("Expected a DataVariableType");
  }
}
export function assertDataEntryType(
  input: unknown,
  assertValid = false
): asserts input is DataEntryType {
  if (
    !(assertValid ? isValidDataEntryType(input, true) : isDataEntryType(input))
  ) {
    throw new Error(`Expected a ${assertValid ? "valid " : ""}DataEntryType`);
  }
}

export function assertDataRangeType(
  input: unknown,
  assertValid = false
): asserts input is DataRangeType {
  if (
    !(assertValid ? isValidDataRangeType(input, true) : isDataRangeType(input))
  ) {
    throw new Error(`Expected a ${assertValid ? "valid " : ""}DataRangeType`);
  }
}

export function assertDataVariableArr(
  input: unknown,
  assertValid = false
): asserts input is Array<DataVariableType> {
  if (
    !(assertValid
      ? isValidDataVariableArr(input, true)
      : isDataVariableArr(input))
  ) {
    throw new Error(
      `Expected a ${assertValid ? "valid " : ""}DataVariableArray`
    );
  }
}

export function assertEntryArr<T = unknown>(
  input: unknown,
  fn: TypeCheckFn<T>,
  assertValid = false
): asserts input is Array<EntryType<T>> {
  if (
    !(assertValid ? isValidEntryArr(input, fn, true) : isEntryArr(input, fn))
  ) {
    throw new Error(`Expected a ${assertValid ? "valid " : ""}EntryArray`);
  }
}

export function assertDataEntryArr(
  input: unknown,
  assertValid = false
): asserts input is Array<DataEntryType> {
  if (
    !(assertValid ? isValidDataEntryArr(input, true) : isDataEntryArr(input))
  ) {
    throw new Error(`Expected a ${assertValid ? "valid " : ""}DataEntryArray`);
  }
}
