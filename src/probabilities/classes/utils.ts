import type {
  DataTagType,
  DataItemType,
  DataItemTypeFromTag,
  DataTagFromItemType,
  DataItemTypeEntry,
} from "./types";
import { DataTagOptions } from "./types";
import {
  assertDataVariableType,
  isDataVariableType,
  isEntryType,
} from "../types";

import { Dice } from "./dice";
import { Collection } from "./collection";

type AssertItemType<Tag extends DataTagType> = Tag extends DataTagType
  ? DataItemTypeFromTag<Tag>
  : never;
type AssertTagType<Type extends DataItemType> = Type extends DataItemType
  ? DataTagFromItemType<Type>
  : never;

export function assertValueForTag<Tag extends DataTagType>(
  tag: Tag,
  value: unknown
): asserts value is AssertItemType<Tag> {
  if (tag === "var") {
    assertDataVariableType(value);
  } else if (tag === "dice") {
    Dice.assertDice(value);
  } else if (tag === "collection") {
    Collection.assertCollection(value);
  } else {
    throw new Error("Attempted to assert value from invalid tag");
  }
}
export function assertTagForValue<Type extends DataItemType>(
  tag: unknown,
  value: Type
): asserts tag is AssertTagType<Type> {
  if (isDataVariableType(value)) {
    if (tag !== "var") {
      throw new Error('Asserted that tag should be "var"');
    }
  } else if (value instanceof Dice) {
    if (tag !== "dice") {
      throw new Error('Asserted that tag should be "dice"');
    }
  } else if (value instanceof Collection) {
    if (tag !== "collection") {
      throw new Error('Asserted that tag should be "collection"');
    }
  } else {
    throw new Error("Attempted to assert tag from invalid value");
  }
}

export function isDataItemType(input: unknown): input is DataItemType {
  return (
    isDataVariableType(input) ||
    input instanceof Dice ||
    input instanceof Collection
  );
}
// Get the tag associated with this type, otherwise throw error
export function getValueTag(input: DataItemType): DataTagType {
  // Get Tag based on data
  if (isDataVariableType(input)) {
    return "var";
  }
  if (input instanceof Dice) {
    return "dice";
  }
  if (input instanceof Collection) {
    return "collection";
  }
  throw new Error("Unexpected data type");
}

export function isDataItemTypeEntry(
  input: unknown
): input is DataItemTypeEntry {
  return isEntryType(input, isDataItemType);
}

export function isDataTagType(input: unknown): input is DataTagType {
  return DataTagOptions.includes(input as DataTagType);
}
