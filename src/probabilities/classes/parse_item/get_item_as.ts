import type { DataTagType, DataItemType } from "../types";
import { Dice } from "../dice";
import { Collection } from "../collection";
import { assertValueForTag, getValueTag } from "../utils";

// Take a a DataItemType and try converting it to the target type, but won't convert dice to var. So will return the value and type of output.
export function getItemAsClosestType(
  value: DataItemType,
  target: DataTagType,
  current?: DataTagType
): DataItemType {
  // if current provided, assert the value and current line up
  if (current) {
    assertValueForTag(current, value);
  }
  let data = value;
  let tag = current ?? getValueTag(value);
  // if initial values are correct, can return without any conversions
  if (tag === target) {
    return data;
  }

  // if output has collection, then we know that target is not a collection, so we can downcast it to a single item now
  if (tag === "collection") {
    // assert it's correct (and types data as collection)
    assertValueForTag(tag, data);
    data = data.toSingleItem();
    tag = data instanceof Dice ? "dice" : "var";
  }

  // make sure everything is set up correctly
  assertValueForTag(tag, data);
  if (target === "collection") {
    return new Collection([data]);
  }

  if (target === "dice") {
    return data instanceof Dice ? data : new Dice([data]);
  }
  return data;
}
// A wrapper of the closest type function, but will throw an error if the result wasn't an exact match
export function getItemAsType(
  value: DataItemType,
  target: DataTagType,
  current?: DataTagType
) {
  const output = getItemAsClosestType(value, target, current);
  assertValueForTag(target, output);
  return output;
}
