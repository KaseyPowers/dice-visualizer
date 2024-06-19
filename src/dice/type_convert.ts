import {
  assertType,
  isDiceArrayType,
  isDiceType,
  isVarType,
} from "./type_check";
import {
  DataType,
  FnDataTypeKey,
  DiceArrayType,
  DiceType,
  FnDataType,
  VarType,
} from "./types";
import { addDice } from "./utils/operations";

export function getTypeKey(input: FnDataType): FnDataTypeKey {
  if (isVarType(input)) {
    return "var";
  }
  if (isDiceType(input)) {
    return "dice";
  }
  if (isDiceArrayType(input)) {
    return "array";
  }
  throw new Error("Unexpected type");
}
export function assertKeyType<K extends FnDataTypeKey = FnDataTypeKey>(
  key: K,
  input: unknown
): asserts input is FnDataType<K> {
  if (key === "array") {
    assertType(input, isDiceArrayType);
  } else if (key === "dice") {
    assertType(input, isDiceType);
  } else if (key === "var") {
    assertType;
  } else {
    throw new Error("Unexpected key value " + key);
  }
}

function shrinkArray(input: DiceArrayType): DiceType {
  const value = addDice(...input);
  if (isDiceArrayType(value)) {
    throw new Error("Error compressing diceArray, got another diceArray");
  }
  return value;
}

export function asVar(input: undefined | FnDataType): VarType | undefined {
  if (typeof input === "undefined") {
    return;
  }
  let value: FnDataType = input;
  if (isDiceArrayType(value)) {
    value = shrinkArray(value);
  }
  if (isVarType(value)) {
    return value;
  }
  // dice can be a variable if it has length 1. Otherwise no
  if (value.length === 1) {
    return value[0][0];
  }
}

export function asDice(input: FnDataType): DiceType {
  let value = input;
  if (isDiceArrayType(value)) {
    value = shrinkArray(value);
  }
  if (isVarType(value)) {
    return [[value, 1]];
  }
  if (isDiceType(value)) {
    return value;
  }
  throw new Error("Unexpected input type");
}
export function asDiceArray(input: FnDataType): DiceArrayType {
  if (isDiceArrayType(input)) {
    return input;
  }
  return [asDice(input)];
}

export function getAsType(input: FnDataType, key: FnDataTypeKey): DataType {
  if (key === "array") {
    return asDiceArray(input);
  }
  return asDice(input);
}
