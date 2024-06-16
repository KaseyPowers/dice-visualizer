import {
  DataEntryType,
  isDataEntryType,
  isDataVariableType,
  type DataVariableType,
} from "@/probabilities/types";
import type { DataTagType, SingleItemType } from "../types";
import { Dice, type DiceInputTypes } from "../dice";
import { getItemAsType } from "./get_item_as";
import { simplifyEntries } from "./simplify_entries";

// Input types for a variable or dice.
export type SingleItemInput =
  | DataVariableType
  | DiceInputTypes
  | Array<DataVariableType | DataEntryType>;

export function isSingleItemInput(input: unknown): input is SingleItemInput {
  // taking advantage of variable type being valid as a dice input too
  return (
    Dice.isInputType(input) ||
    (Array.isArray(input) &&
      input.every((val) => isDataVariableType(val) || isDataEntryType(val)))
  );
}

// return a single item, will return a variable or Dice, a tag can be provided if one is preferred. The variable as range-max behavior for dice requires the tag to be specified
export function toSingleItem(
  input: SingleItemInput,
  tag?: DataTagType
): SingleItemType {
  // if initial input is a var and tag specified dice, use it. Otherwise variable after simplifying data will be kept as a variable
  if (isDataVariableType(input) && tag === "dice") {
    return new Dice(input);
  }
  // simplify incoming data to be safe
  const data: DiceInputTypes = Array.isArray(input)
    ? simplifyEntries(input)
    : input;

  if (isDataVariableType(data)) {
    return data;
  }
  return new Dice(data);
}
// wrap logic with checker to verify or convert output type if one is expected
export function getSingleItem(
  input: SingleItemInput,
  tag?: Exclude<DataTagType, "collection">
) {
  const output = toSingleItem(input, tag);
  return tag ? getItemAsType(output, tag) : output;
}
