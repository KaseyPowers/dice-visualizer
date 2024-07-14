import type {
  FnDataType,
  FnDataTypeKey,
  DiceFnResult,
  DiceArrayFnResult,
} from "../types";
import { asVar } from "../type_convert";
import { flattenDiceArrayResults, flattenDiceResults } from "./flatten_outputs";
import { isDataTypeKey } from "../type_check";

import { buildOutputs, buildRecursive } from "./build_outputs";

import type {
  InputFnDef,
  InputKeyTypeForParams,
  OutputFunctionType,
  InputFnDefFromKeys,
} from "./internal_types";

const useRecursive = true;

const useBuildOutputs = useRecursive ? buildRecursive : buildOutputs;

function isFnKeyFirst(
  input: unknown,
): input is [FnDataTypeKey | Array<FnDataTypeKey>, FnDataTypeKey, InputFnDef] {
  return (
    Array.isArray(input) &&
    (isDataTypeKey(input[0]) ||
      (Array.isArray(input[0]) && input[0].every((val) => isDataTypeKey(val))))
  );
}

export function wrapFunction<
  InParams extends FnDataType[],
  Out extends FnDataTypeKey,
>(
  fn: InputFnDef<InParams>,
  inputKeys: InputKeyTypeForParams<InParams>,
  out: Out,
): OutputFunctionType<InParams, Out>;
export function wrapFunction<
  Input extends FnDataTypeKey,
  Out extends FnDataTypeKey,
>(
  inputKey: Input,
  out: Out,
  fn: InputFnDefFromKeys<Input[]>,
): OutputFunctionType<Input[], Out>;
export function wrapFunction<
  Input extends FnDataTypeKey,
  Out extends FnDataTypeKey,
>(
  fn: InputFnDefFromKeys<Input[]>,
  inputKeys: Input,
  out: Out,
): OutputFunctionType<Input[], Out>;
export function wrapFunction<
  Inputs extends FnDataTypeKey[],
  Out extends FnDataTypeKey,
>(
  fn: InputFnDefFromKeys<Inputs>,
  inputKeys: Inputs,
  out: Out,
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

  const getKey =
    Array.isArray(inputKeys) ?
      (index: number) => inputKeys[index]
    : () => inputKeys;

  const buildTarget = out === "var" ? "dice" : out;

  return function (...items) {
    const allOutputs = useBuildOutputs(items, getKey, fn, buildTarget);
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
