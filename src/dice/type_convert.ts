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
  AsDataTypeKey,
  DataTypeKey,
} from "./types";
import { addDice } from "./functions/operations";

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

export function getDataType<Key extends DataTypeKey>(
  input: FnDataType,
  key: Key
): DataType<Key>;
export function getDataType(input: FnDataType, key: DataTypeKey): DataType {
  let value = input;
  if (isVarType(value)) {
    value = [[value, 1]];
  }
  if (key === "dice") {
    if (isDiceArrayType(value)) {
      // Will break if it supports shrinking straight to a var
      value = addDice(...value);
    }
    assertKeyType(key, value);
    return value;
  }
  if (isDiceType(value)) {
    value = [value];
  }
  assertKeyType(key, value);
  return value;
}

export function getClosestType<
  Key extends FnDataTypeKey,
  Strict extends boolean
>(key: Key, input: FnDataType): FnDataType<Key> | DataType<AsDataTypeKey<Key>>;
export function getClosestType(
  key: FnDataTypeKey,
  input: FnDataType
): FnDataType | DataType {
  if (key === "var" && isVarType(input)) {
    return input;
  }
  if (key === "array") {
    // can handle converting any value to array;
    return getDataType(input, key);
  }
  /** Step towards closer type:
   * target key must be "var" or "dice" after checking for "array"
   * if target = "var", we know value is not var or it would have returned at start, so value would be dice or array, either way, converting to dice will leave it unchanged or a step closer
   * if target = "dice", then value will get converted to dice whatever it is.
   */
  const diceValue = getDataType(input, "dice");
  if (key === "var" && diceValue.length === 1) {
    return diceValue[0][0];
  }
  return diceValue;
}
export function getAsType<Key extends DataTypeKey>(
  key: Key,
  input: FnDataType
): DataType<Key>;
export function getAsType<
  Key extends FnDataTypeKey,
  Strict extends boolean = true
>(
  key: Key,
  input: FnDataType,
  strict?: Strict
):
  | FnDataType<Key>
  | ("var" extends Key ? (true extends Strict ? never : undefined) : never);
export function getAsType(
  key: FnDataTypeKey,
  input: FnDataType,
  strict = true
): FnDataType | undefined {
  // get closest type, and make sure it lines up before returning.
  const result = getClosestType(key, input);
  // only type that should be possible to miss-align is a target for var. So return undefined directly
  // Doing this setup to let assert catch any unexpected cases even if strict is false
  if (!strict && key === "var" && !isVarType(result)) {
    return;
  }
  // otherwise will assert key+value match to throw an error if not correct.
  assertKeyType(key, result);
  return result;
}

export const asVar = (input: FnDataType) => getAsType("var", input, false);
export const asDice = (input: FnDataType) => getAsType("dice", input, true);
export const asDiceArray = (input: FnDataType) =>
  getAsType("array", input, true);
