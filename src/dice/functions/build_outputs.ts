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
import type { BuildOutputsFn, OutputFunctionReturns } from "./fn_wrapper";

export const buildRecursive: BuildOutputsFn = function (
  items,
  getKey,
  fn,
  outputKey
) {
  function buildOutputs(
    params: FnDataType[],
    count: number
  ): Entry<OutputFunctionReturns>[] {
    const index = params.length;
    if (index >= items.length) {
      const result = createAsType(outputKey, fn(...params));
      return [[result, count]];
    }
    const target = getKey(index);
    // we should get item as closest to the type needed for target
    const item = getClosestType(target, items[index]);
    const itemKey = getTypeKey(item);
    if (itemKey === target) {
      return buildOutputs([...params, item], count);
    }
    // the only combination that should be possible here is dice but target "var", verify here
    if (target !== "var" || itemKey !== "dice") {
      throw new Error(
        `Only type mismatch expected is target "var" and with "dice", but received target "${target}" and item "${itemKey}"`
      );
    }
    assertKeyType(itemKey, item);
    return item.reduce<Entry<OutputFunctionReturns>[]>((output, entry) => {
      output.push(...buildOutputs([...params, entry[0]], count + entry[1]));
      return output;
    }, []);
  }
  return buildOutputs([], 1);
};

type InputsEntry = Entry<FnDataType[]>[];
export const buildOutputs: BuildOutputsFn = function (
  items,
  getKey,
  fn,
  outputKey
) {
  let inputs: InputsEntry = [[[], 1]];

  items.forEach((inputItem, index) => {
    const target = getKey(index);
    // we should get item as closest to the type needed for target
    const item = getClosestType(target, inputItem);
    const itemKey = getTypeKey(item);
    if (itemKey === target) {
      inputs.forEach((input) => {
        input[0].push(item);
      });
      return;
    }
    // the only combination that should be possible here is dice but target "var", verify here
    if (target !== "var" || itemKey !== "dice") {
      throw new Error(
        `Only type mismatch expected is target "var" and with "dice", but received target "${target}" and item "${itemKey}"`
      );
    }
    assertKeyType(itemKey, item);
    inputs = item.reduce<InputsEntry>((output, entry) => {
      return output.concat(
        inputs.map((input) => [[...input[0], entry[0]], input[1] + entry[1]])
      );
    }, []);
  });

  //   return inputs.map<Entry<OutputFunctionReturns>>(([params, count]) => {
  return inputs.map(([params, count]) => {
    const result = createAsType(outputKey, fn(...params));
    return [result, count];
  });
};
