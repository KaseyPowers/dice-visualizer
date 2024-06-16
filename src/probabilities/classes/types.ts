import type { DataVariableType, EntryType } from "../types";

import { Dice } from "./dice";
import { Collection } from "./collection";

export const DataTagOptions = ["var", "dice", "collection"] as const;
export type DataTagType = (typeof DataTagOptions)[number];
export type SingleItemType = DataVariableType | Dice;
export type DataItemType = SingleItemType | Collection;
export type DataItemTypeEntry = EntryType<DataItemType>;

// In case of unions (should be avoided, but just in case), will check from largest to smallest, returning first find
export type DataItemTypeFromTag<Tag extends DataTagType> =
  "collection" extends Tag
    ? Collection
    : "dice" extends Tag
    ? Dice
    : "var" extends Tag
    ? DataVariableType
    : never;
// for the general function definitions, if input is full union, return full union instead of "collection"
export type UseDataItemTypeFromTag<Tag extends DataTagType> = [
  DataTagType
] extends [Tag]
  ? DataItemType
  : DataItemTypeFromTag<Tag>;

export type DataTagFromItemType<Type extends DataItemType> =
  Collection extends Type
    ? "collection"
    : Dice extends Type
    ? "dice"
    : DataVariableType extends Type
    ? "var"
    : never;
