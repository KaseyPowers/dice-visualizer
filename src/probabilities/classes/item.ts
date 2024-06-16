import { isDataVariableType } from "../types";
import { DataItemType, DataTagType } from "./types";
import { assertTagForValue, assertValueForTag, isDataTagType } from "./utils";
import { getItemAsClosestType } from "./parse_item/get_item_as";
import {
  getItemCloseTo,
  getItem,
  AllGetItemInputs,
} from "./parse_item/get_item";
import { Dice } from "./dice";
import { Collection } from "./collection";

type ParsableInput = unknown;

export class DataItem {
  readonly tag: DataTagType;
  readonly data: DataItemType;

  static getItem(
    tag: DataTagType,
    input: AllGetItemInputs,
    strict?: boolean
  ): DataItem;
  static getItem(input: AllGetItemInputs): DataItem;
  static getItem(
    tagOrInput: DataTagType | AllGetItemInputs,
    orInput?: AllGetItemInputs,
    strict?: boolean
  ) {
    let input: AllGetItemInputs;
    let tag: DataTagType | undefined;
    if (isDataTagType(tagOrInput)) {
      tag = tagOrInput;
      if (typeof orInput === "undefined") {
        throw new Error(
          "expected input in second argument if first is the tag"
        );
      }
      input = orInput;
    } else {
      input = tagOrInput;
    }
    // strict handles how closely we want item to be or throwing an error, so don't pass tag to the constructor
    const item = strict ? getItem(input, tag) : getItemCloseTo(input, tag);
    return new DataItem(item);
  }

  // base constructor accepts pre-built inputs, and will throw an error if a tag is used and the output doesn't match (does try casting input to the desired tag)
  constructor(tag: DataTagType, value: DataItemType);
  constructor(value: DataItemType);
  constructor(tagOrValue: DataTagType | DataItemType, orValue?: DataItemType) {
    let tag: DataTagType;
    let data: DataItemType;
    if (isDataTagType(tagOrValue)) {
      tag = tagOrValue;
      if (typeof orValue === "undefined") {
        throw new Error(
          "Invalid input, if first param is tag, second shoudld be provided"
        );
      }
      data = orValue;
      // cast to the desired type if needed.
      data = getItemAsClosestType(data, tag);
    } else {
      data = tagOrValue;
      // Get Tag based on data
      if (isDataVariableType(data)) {
        tag = "var";
      } else if (data instanceof Dice) {
        tag = "dice";
      } else if (data instanceof Collection) {
        tag = "collection";
      } else {
        throw new Error("Unexpected data type");
      }
    }
    // don't need to assert both directions, but feels safer
    assertTagForValue(tag, data);
    assertValueForTag(tag, data);
    this.tag = tag;
    this.data = data;
  }
  getClosestType(target: DataTagType) {
    return getItemAsClosestType(this.data, target, this.tag);
  }
}
