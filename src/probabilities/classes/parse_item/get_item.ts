import {
  DataEntryType,
  isDataEntryType,
  isDataVariableType,
  isEntryType,
  type DataVariableType,
  type EntryType,
} from "@/probabilities/types";
import type { DataTagType, DataItemType, SingleItemType } from "../types";
import { Dice, type DiceInputTypes } from "../dice";
import {
  Collection,
  type CollectionDataType,
  type CollectionItemType,
} from "../collection";
import {
  type SingleItemInput,
  isSingleItemInput,
  toSingleItem,
} from "./get_single_item";
import { getItemAsClosestType, getItemAsType } from "./get_item_as";

// helper, spread union, and anywhere Dice is defined, replace it with the DiceInputTypes, will also recusively dig inside Entry and Array Types
type ReplaceDiceInputs<T> = T extends any
  ? T extends Dice
    ? DiceInputTypes
    : T extends EntryType<infer E>
    ? EntryType<ReplaceDiceInputs<E>>
    : T extends Array<infer I>
    ? Array<ReplaceDiceInputs<I>>
    : T
  : never;

type CollectionInputs =
  | ReplaceDiceInputs<CollectionDataType>
  | CollectionDataType;
export type AllGetItemInputs = SingleItemInput | CollectionInputs;
// parse to best type for input (influenced by tag if provided). Rely on other function to cast if needed
function toItem(input: AllGetItemInputs, tag?: DataTagType): DataItemType {
  /**
   * if expecting collection and inputType is valid, do conversion right away.
   * Skips conflict of types between a collection of variables and a Dice from array of values.
   * (ex. d{1, 2, 3, 4} vs. [1, 2, 3, 4])
   */
  if (tag === "collection" && Collection.isInputType(input)) {
    return new Collection(input);
  }
  // if input is for a single item, return that item (collection will convert it later)
  if (isSingleItemInput(input)) {
    return toSingleItem(input, tag);
  }
  if (Collection.isInputType(input)) {
    return new Collection(input);
  }
  // potentially could do recursive steps here, but I don't want to deal with overly deep input structures.
  if (Array.isArray(input)) {
    return new Collection(
      input.map<CollectionItemType>((val) => {
        // check if entry type input or not
        if (isEntryType(val, isSingleItemInput)) {
          return [toSingleItem(val[0]), val[1]];
        }
        return toSingleItem(val);
      })
    );
  }
  throw new Error("Unexpected input");
}
export function getItem(input: AllGetItemInputs, tag?: DataTagType) {
  const output = toItem(input, tag);
  return tag ? getItemAsType(output, tag) : output;
}
// still optional tag just so that this is safe to use in constructors and such that might not require the tag
export function getItemCloseTo(input: AllGetItemInputs, tag?: DataTagType) {
  const output = toItem(input, tag);
  return tag ? getItemAsClosestType(output, tag) : output;
}
