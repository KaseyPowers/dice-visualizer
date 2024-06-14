import type { DataVariableType, EntryType } from "../types";

import { Dice } from "./dice";
import { Collection } from "./collection";

export type DataTagType = "var" | "dice" | "collection";
export type DataItemType = DataVariableType | Dice | Collection;
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

export type DataTagFromItemType<Type extends DataItemType> =
  Collection extends Type
    ? "collection"
    : Dice extends Type
    ? "dice"
    : DataVariableType extends Type
    ? "var"
    : never;
