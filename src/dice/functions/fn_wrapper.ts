import type {
  AsDataTypeKey,
  FnDataType,
  FnDataTypeKey,
  DataType,
  DiceFnResult,
  DiceArrayFnResult,
  Entry,
  DataTypeInput,
  DataKeyForType,
  DiceArrayType,
  VarType,
  DataTypeKey,
} from "../types";
import {
  asVar,
  assertKeyType,
  getClosestType,
  getTypeKey,
} from "../type_convert";
import { flattenDiceArrayResults, flattenDiceResults } from "./flatten_outputs";
import { createAsType } from "../create";
import { ArrayItemType, IsSingleTypeArray } from "@/utils/types";
import { isDataTypeKey } from "../type_check";

import { buildRecursive, buildOutputs } from "./build_outputs";

type InputFnDef<Inputs extends FnDataType[] = FnDataType[]> = (
  ...inputs: Inputs
) => DataTypeInput;
type MapKeysToType<Keys extends Array<FnDataTypeKey>> = {
  [K in keyof Keys]: FnDataType<Keys[K]>;
};
type InputFnDefFromKeys<Keys extends Array<FnDataTypeKey>> = InputFnDef<
  MapKeysToType<Keys>
>;
type MapTypesToKeys<Types extends Array<FnDataType>> = {
  [P in keyof Types]: DataKeyForType<Types[P]>;
};

type InputKeysForArr<Keys extends FnDataTypeKey[]> =
  | Keys
  | IsSingleTypeArray<Keys, ArrayItemType<Keys>>;

type InputKeysByParams<Params extends FnDataType[]> = InputKeysForArr<
  MapTypesToKeys<Params>
>;

type MapToAnyFnDataType<Input extends unknown[] = unknown[]> = {
  [K in keyof Input]: FnDataType;
};

export type OutputFunctionReturns<Out extends FnDataTypeKey = FnDataTypeKey> =
  | DataType<AsDataTypeKey<Out>>
  | FnDataType<Out>;

type OutputFunctionType<
  Inputs extends unknown[] = unknown[],
  Out extends FnDataTypeKey = FnDataTypeKey
> = (...items: MapToAnyFnDataType<Inputs>) => OutputFunctionReturns<Out>;

export type BuildOutputsFn = (
  items: FnDataType[],
  getKey: (index: number) => FnDataTypeKey,
  fn: InputFnDef,
  outputKey: DataTypeKey
) => Entry<OutputFunctionReturns>[];

function isFnKeyFirst(
  input: unknown
): input is [FnDataTypeKey | Array<FnDataTypeKey>, FnDataTypeKey, InputFnDef] {
  return (
    Array.isArray(input) &&
    (isDataTypeKey(input[0]) ||
      (Array.isArray(input[0]) && input[0].every((val) => isDataTypeKey(val))))
  );
}

export function wrapFunction<
  InParams extends FnDataType[],
  Out extends FnDataTypeKey
>(
  fn: InputFnDef<InParams>,
  inputKeys: InputKeysByParams<InParams>,
  out: Out
): OutputFunctionType<InParams, Out>;
export function wrapFunction<
  Input extends FnDataTypeKey,
  Out extends FnDataTypeKey
>(
  inputKey: Input,
  out: Out,
  fn: InputFnDefFromKeys<Input[]>
): OutputFunctionType<Input[], Out>;
export function wrapFunction<
  Input extends FnDataTypeKey,
  Out extends FnDataTypeKey
>(
  fn: InputFnDefFromKeys<Input[]>,
  inputKeys: Input,
  out: Out
): OutputFunctionType<Input[], Out>;
export function wrapFunction<
  Inputs extends FnDataTypeKey[],
  Out extends FnDataTypeKey
>(
  fn: InputFnDefFromKeys<Inputs>,
  inputKeys: Inputs,
  out: Out
): OutputFunctionType<Inputs, Out>;
export function wrapFunction(
  ...args:
    | [InputFnDef, FnDataTypeKey | Array<FnDataTypeKey>, FnDataTypeKey]
    | [FnDataTypeKey | Array<FnDataTypeKey>, FnDataTypeKey, InputFnDef]
): // fn: InputFnDef,
// inputKeys: FnDataTypeKey | Array<FnDataTypeKey>,
// out: FnDataTypeKey
OutputFunctionType {
  let fn: InputFnDef;
  let inputKeys: FnDataTypeKey | FnDataTypeKey[];
  let out: FnDataTypeKey;
  if (isFnKeyFirst(args)) {
    [inputKeys, out, fn] = args;
  } else {
    [fn, inputKeys, out] = args;
  }

  const getKey = Array.isArray(inputKeys)
    ? (index: number) => inputKeys[index]
    : () => inputKeys;

  const buildTarget = out === "var" ? "dice" : out;

  return function (...items) {
    const allOutputs = buildOutputs(items, getKey, fn, buildTarget);
    if (out === "array") {
      return flattenDiceArrayResults(allOutputs as DiceArrayFnResult[]);
    }
    const finalDice = flattenDiceResults(allOutputs as DiceFnResult[]);
    // it ouptut type is var, attempt to convert to var before returning
    if (out === "var") {
      const result = asVar(finalDice);
      if (typeof result !== "undefined") {
        return result;
      }
    }
    return finalDice;
  };
}

export function wrapArraySpreadFn<
  SpreadType extends Exclude<FnDataTypeKey, "array">,
  Out extends FnDataTypeKey
>(spreadInput: SpreadType, out: Out, fn: InputFnDefFromKeys<SpreadType[]>) {
  const innerFn = wrapFunction(fn, spreadInput, out);
  return wrapFunction(
    (array: DiceArrayType) => innerFn(...array),
    "array",
    out
  );
}
