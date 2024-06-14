import {
  isDataVariableType,
  DataVariableType,
  isDataRangeType,
  isDataVariableArr,
} from "../types";
import type {
  DataTagType,
  DataItemTypeFromTag,
  DataItemType,
  DataTagFromItemType,
} from "./types";
import { assertTagForValue, assertValueForTag, isDataItemType } from "./utils";
import { Dice } from "./dice";
import { Collection } from "./collection";

type UseDataItemTypeFromTag<Tag extends DataTagType> = [DataTagType] extends [
  Tag
]
  ? DataItemType
  : DataItemTypeFromTag<Tag>;

type DataItemTypeFromType<T extends DataItemType> =
  T extends DataItemTypeFromTag<DataTagFromItemType<T>>
    ? DataItem<DataTagFromItemType<T>, T>
    : never;

export class DataItem<
  Tag extends DataTagType = DataTagType,
  Type extends UseDataItemTypeFromTag<Tag> = UseDataItemTypeFromTag<Tag>
> {
  private readonly tag: Tag;
  private readonly data: Type;

  static newVariable(input: DataVariableType) {
    return new DataItem("var", input);
  }
  // for these types, skip the constructors potentially handling copying of an existing instance, and just pass the reference around
  static newDice(input: ConstructorParameters<typeof Dice>[0]) {
    return new DataItem(
      "dice",
      input instanceof Dice ? input : new Dice(input)
    );
  }
  static newCollection(
    input: Collection | ConstructorParameters<typeof Collection>[0]
  ) {
    return new DataItem(
      "collection",
      input instanceof Collection ? input : new Collection(input)
    );
  }

  static newItem<T extends DataItemType>(value: T): DataItemTypeFromType<T>;
  static newItem(value: DataItemType) {
    if (isDataVariableType(value)) {
      return new DataItem("var", value);
    } else if (value instanceof Dice) {
      return new DataItem("dice", value);
    } else if (value instanceof Collection) {
      return new DataItem("collection", value);
    } else {
      throw new Error("Unexpected input type", value);
    }
  }

  private constructor(tag: Tag, value: Type) {
    assertTagForValue(tag, value);
    assertValueForTag(tag, value);
    this.tag = tag;
    this.data = value;
  }

  // If current type isn't the desired tag, will attempt to convert to the closest type for wrapper function logic
  toClosestDataType(target: DataTagType): DataItemType {
    // easy return early if tag and target match
    if (target === this.tag) {
      return this.data;
    }
    let currentType: DataTagType = this.tag;
    let data: DataItemType = this.data;
    // if tag is collection, and we know target is something else, set output data to single item type
    if (currentType === "collection") {
      assertValueForTag(currentType, data);
      data = data.toSingleItem();
      currentType = data instanceof Dice ? "dice" : "var";
    }
    assertValueForTag(currentType, data);
    // if target is collection, we can convert data up
    if (target === "collection") {
      return new Collection([data]);
      // return DataItem.newCollection([data]);
    }
    // if target is dice, can upscale a variable
    if (target === "dice") {
      return data instanceof Dice ? data : new Dice([data]);
      // return DataItem.newDice(data instanceof Dice ? data : [data]);
    }
    // all that's left is target = "var" and data that's a var or Dice. So no more casting needed.
    return data;
    // return DataItem.newItem(data);
  }
}
