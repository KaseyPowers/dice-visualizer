import type {
  FnDataTypeKey,
  DiceArrayType,
  DiceType,
  Entry,
  VarEntry,
  VarType,
  DataType,
  FnDataType,
  RangeInput,
  DiceInputTypes,
  ArrayInputType,
} from "./types";
import { DataTypeOptions } from "./types";

export function isDataTypeKey(input: unknown): input is FnDataTypeKey {
  return DataTypeOptions.includes(input as FnDataTypeKey);
}

type TypeCheckFn<T> = (input: unknown) => input is T;

export function isEntry<T>(
  input: unknown,
  fn: TypeCheckFn<T>
): input is Entry<T> {
  return (
    Array.isArray(input) &&
    input.length === 2 &&
    typeof input[1] === "number" &&
    input[1] >= 1 &&
    fn(input[0])
  );
}

export function isVarType(input: unknown): input is VarType {
  return typeof input === "number";
}
export function isVarEntry(input: unknown): input is VarEntry {
  return isEntry(input, isVarType);
}
export function isDiceType(input: unknown): input is DiceType {
  return Array.isArray(input) && input.every((val) => isVarEntry(val));
}
export function isDiceArrayType(input: unknown): input is DiceArrayType {
  return Array.isArray(input) && input.every((val) => isDiceType(val));
}

export function isDataType(input: unknown): input is DataType {
  return isDiceArrayType(input) || isDiceType(input);
}
export function isFnDataType(input: unknown): input is FnDataType {
  return isDataType(input) || isVarType(input);
}

export function assertType<T>(
  input: unknown,
  fn: TypeCheckFn<T>,
  typeStr?: string
): asserts input is T {
  if (!fn(input)) {
    throw new Error(
      `Incorrectly asserted ${typeStr ? "input is " + typeStr : fn.name}`
    );
  }
}

function isRangeInput(input: unknown): input is RangeInput {
  return (
    !!input &&
    typeof input === "object" &&
    "max" in input &&
    isVarType(input.max) &&
    (!("min" in input) || isVarType(input.min))
  );
}
function isVarArray(input: unknown): input is Array<VarType> {
  return Array.isArray(input) && input.every((val) => isVarType(val));
}
export function isDiceInput(input: unknown): input is DiceInputTypes {
  return (
    isVarType(input) ||
    isRangeInput(input) ||
    isVarArray(input) ||
    isDiceType(input)
  );
}
export function isDiceArrayInput(input: unknown): input is ArrayInputType {
  return (
    isDiceInput(input) ||
    (Array.isArray(input) && input.every((val) => isDiceInput(val)))
  );
}
