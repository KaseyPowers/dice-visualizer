import {
  DataItem,
  DataItemTypeEntry,
  Dice,
  DiceInnerDataTypes,
  isDataItemType,
} from "../classes";
import {
  isDataRangeType,
  isDataVariableArr,
  isDataVariableType,
} from "../types";
import { flattenIfNeeded, isDataItemTypeEntryArr } from "./flatten_entries";
import { simplifyEntries } from "./simplify_entries";
import { varsAreUnique } from "./unique_vars";

function parseSingleInputType(
  input: DiceInnerDataTypes | Array<DataItemTypeEntry>
) {
  // Range isn't able to be optomized any more
  if (isDataRangeType(input)) {
    return DataItem.newDice(input);
  }
  const entries = isDataItemTypeEntryArr(input)
    ? flattenIfNeeded(input)
    : input;
  const data = simplifyEntries(entries);
  if (isDataVariableType(data)) {
    return DataItem.newVariable(data);
  }
  return DataItem.newDice(data);
}

export function parseSingleDataItem(input: SingleInputTypes): DataItem {
  if (input instanceof DataItem) {
    // copy or return unchanged?
    return input;
  }
  // if a value that can be used directly in an item, create it
  if (isDataItemType(input)) {
    return DataItem.newItem(input);
  }
  return;
  // Range isn't able to be optomized any more
  if (isDataRangeType(input)) {
    return DataItem.newDice(input);
  }

  const entries = isDataItemTypeEntryArr(input)
    ? flattenIfNeeded(input)
    : input;
  const data = simplifyEntries(entries);

  throw new Error("Unsupported input");
}
