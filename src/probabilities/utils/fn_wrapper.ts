import type { IsSingleTypeArray, ArrayItemType } from "@/utils/types";
import type { DataVariableType, EntryType } from "../types";
import { isDataVariableType } from "../types";

import type {
  DataTagType,
  DataItemType,
  DataTagFromItemType,
  DataItemTypeFromTag,
} from "../classes";
import { DataItem, Dice, assertValueForTag } from "../classes";
import { flattenDataItemEntries } from "./flatten_entries";
import { parseSingleDataItem } from "./parse";

/**
 * Notes:
 * - Functions have parameters that accept one of allowed types
 * - To use them, this wrapper will need the fn and an array of the expected types.
 *     - TODO: decide if using static set of params, or mix in arrays to allow for unknown quantities (ex. for a function like sum(...items: DataItem[]) to add many values together.) the rules for that.
 * - Wrapped function will accept any type for each parameter, then convert to handle it.
 *
 * Base Types: from smallest to largest - "var", "dice", "collection"
 * Simplified conversion logic:
 * - Everything can move up to larger size without changes to output
 * - If Dice used for var, will call fn with each value, and combine results. making output upcast
 *  - NOTE: might have room for fancyness around collections. Ex. from anydice: [highest 2 of 4d4] could potentially output a collection of 2 dice, with their new probabilities.
 * - If collection used for anything else. downcast to a single value (Var or Dice possible) then cast that to the final type
 */

// type CheckInput = [first: boolean, ...middle: string[], last: number];

// type ToString<T> = T extends boolean
//   ? "boolean"
//   : T extends number
//   ? "number"
//   : T extends string
//   ? "string"
//   : "unknown";
// type TestRecord<T> = {
//   [K in keyof T]: ToString<T[K]>;
// };
// type TestArrayTypes<T extends Array<boolean | string | number>> = TestRecord<T>;

// type check = TestRecord<CheckInput>;
// type check2 = TestArrayTypes<CheckInput>;

type DataTagInputFromTags<Input extends Array<DataTagType>> =
  | (IsSingleTypeArray<Input, 1, 0> extends 1 ? ArrayItemType<Input> : never)
  | Input;

type DataTagInputFromParams<Input extends Array<DataItemType>> =
  | (IsSingleTypeArray<Input, 1, 0> extends 1
      ? DataTagFromItemType<ArrayItemType<Input>>
      : never)
  | {
      [K in keyof Input]: DataTagFromItemType<Input[K]>;
    };

type DataParamsFromTags<Input extends Array<DataTagType>> = {
  [K in keyof Input]: DataItemTypeFromTag<Input[K]>;
};
// No need for DataParamsFromParams

// NOTE: could accept more types of responses but let's start simple
type InputFnDef<
  Params extends Array<DataItemType> = Array<DataItemType>,
  R extends DataItemType = DataItemType
> = (...args: Params) => R;

type ParamsAsItems<Params extends Array<DataItemType>> = {
  [K in keyof Params]: DataItem;
};

/**
 * NOTES:
 * 2 ways to handle dice as vars:
 * - map all inputs to closest types, then use a recursive function to build out the final inputs and catch the dice to split the implementations.
 * - iterate through inputs, and built out an array of input params in one go.
 */

function fromOutput(outputs: EntryType<DataItemType>[]) {
  if (outputs.length < 1) {
    throw new Error("No outputs?");
  }
  if (outputs.length === 1) {
    return DataItem.newItem(outputs[0][0]);
  }
  return parseSingleDataItem(outputs);
}

type InnerWrapFn = (
  fn: InputFnDef,
  getTarget: (index: number) => DataTagType
) => (...items: DataItem[]) => DataItem;

// Wrote out both functions. I'm sure there will be situations where one is better than the other. Can sort that out later.
const wrapRecursive: InnerWrapFn = (fn, getTarget) => {
  return function (...items) {
    function buildOutput(
      params: Array<DataItemType>,
      count: number
    ): EntryType<DataItemType>[] {
      const index = params.length;
      // if ran out of items to add, run function and add output
      if (index >= items.length) {
        const result = fn(...params);
        return [[result, count]];
      }
      const target = getTarget(index);
      const data = items[index].toClosestDataType(target);
      if (target === "var" && data instanceof Dice) {
        return data.entries.reduce((output, entry) => {
          // TODO: Confirm the count math here
          return output.concat(
            buildOutput([...params, entry[0]], count + entry[1])
          );
        }, [] as EntryType<DataItemType>[]);
      } else {
        assertValueForTag(target, data);
        return buildOutput([...params, data], count);
      }
    }
    const output = buildOutput([], 1);
    return fromOutput(output);
  };
};

const wrapInPlace: InnerWrapFn = (fn, getTarget) => {
  return function (...items) {
    let inputs: EntryType<DataItemType[]>[] = [[[], 1]];
    items.forEach((item, index) => {
      const targetType = getTarget(index);
      const data = item.toClosestDataType(targetType);
      // Validate the generated values.
      // if returned a dice for a var, make sure we flag it
      if (targetType === "var" && data instanceof Dice) {
        // spread dice over inputs
        inputs = data.entries.reduce((output, entry) => {
          return output.concat(
            inputs.map((inputEntry) => [
              [...inputEntry[0], entry[0]],
              inputEntry[1] + entry[1],
            ])
          );
        }, [] as typeof inputs);
      } else {
        assertValueForTag(targetType, data);
        // if values line up, just add to the inputs and continue
        inputs.forEach((inputEntry) => {
          inputEntry[0].push(data);
        });
      }
    });

    const outputs: EntryType<DataItemType>[] = inputs.map(([params, count]) => {
      return [fn(...params), count];
    });
    return fromOutput(outputs);
  };
};

// TODO generic overloads
export function wrapFn(fn: InputFnDef, tags: DataTagType | DataTagType[]) {
  const getTagForIndex: (index: number) => DataTagType = Array.isArray(tags)
    ? (i) => tags[i]
    : () => tags;
  return wrapRecursive(fn, getTagForIndex);
}
