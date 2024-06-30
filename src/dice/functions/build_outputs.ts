import type { FnDataType, Entry } from "../types";
import { assertKeyType, getClosestType, getTypeKey } from "../type_convert";
import { createAsType } from "../create";
import type { BuildOutputsFn, OutputFunctionReturns } from "./internal_types";

export const buildRecursive: BuildOutputsFn = function (
  items,
  getKey,
  fn,
  outputKey,
) {
  function buildOutputs(
    prevParams: FnDataType[],
    count: number,
  ): Entry<OutputFunctionReturns>[] {
    const nextParams = [...prevParams];
    while (nextParams.length < items.length) {
      const index = nextParams.length;
      const target = getKey(index);
      // we should get item as closest to the type needed for target
      const item = getClosestType(target, items[index]);
      const itemKey = getTypeKey(item);
      if (itemKey !== target) {
        // the only combination that should be possible here is dice but target "var", verify here
        if (target !== "var" || itemKey !== "dice") {
          throw new Error(
            `Only type mismatch expected is target "var" and with "dice", but received target "${target}" and item "${itemKey}"`,
          );
        }
        assertKeyType("dice", item);
        return item.reduce<Entry<OutputFunctionReturns>[]>((output, entry) => {
          output.push(
            ...buildOutputs([...nextParams, entry[0]], count + entry[1]),
          );
          return output;
        }, []);
      }
      nextParams.push(item);
    }
    const results = createAsType(outputKey, fn(...nextParams));
    return [[results, count]];
  }
  return buildOutputs([], 1);
};

type InputsEntry = Entry<FnDataType[]>[];
export const buildOutputs: BuildOutputsFn = function (
  items,
  getKey,
  fn,
  outputKey,
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
        `Only type mismatch expected is target "var" and with "dice", but received target "${target}" and item "${itemKey}"`,
      );
    }
    assertKeyType(itemKey, item);
    inputs = item.reduce<InputsEntry>((output, entry) => {
      return output.concat(
        inputs.map((input) => [[...input[0], entry[0]], input[1] + entry[1]]),
      );
    }, []);
  });

  //   return inputs.map<Entry<OutputFunctionReturns>>(([params, count]) => {
  return inputs.map(([params, count]) => {
    const result = createAsType(outputKey, fn(...params));
    return [result, count];
  });
};
