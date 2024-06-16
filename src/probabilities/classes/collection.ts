import {
  isDataVariableType,
  isEntryType,
  type DataVariableType,
  type EntryType,
} from "../types";
import type { SingleItemType } from "./types";

import { Dice } from "./dice";
import { DataItem } from "./item";

import add from "../operations/add";

export type CollectionItemType = SingleItemType | EntryType<SingleItemType>;

export type CollectionDataType = Array<CollectionItemType>;

// Holds multiple Dice/Variables - Could mix this into DataItem container with it's `toSingleItem` overlapping the getClosestDataType, but I suspect there will be extra features to containers that will be added later
export class Collection {
  static assertCollection(input: unknown): asserts input is Collection {
    if (!(input instanceof Collection)) {
      throw new Error("Asserted value was a Collection instance");
    }
  }
  static isInputType(input: unknown): input is CollectionDataType {
    return (
      Array.isArray(input) &&
      input.every(
        (part) =>
          isDataVariableType(part) ||
          part instanceof Dice ||
          isEntryType(part, (val): val is Dice => val instanceof Dice)
      )
    );
  }
  constructor(private readonly data: CollectionDataType) {}

  flatten(): Array<DataVariableType | Dice> {
    return this.data.reduce((output, part) => {
      if (isEntryType(part, (val): val is Dice => val instanceof Dice)) {
        const [val, count] = part;
        output.push(...new Array(count).fill(val));
      } else if (isDataVariableType(part) || part instanceof Dice) {
        output.push(part);
      } else {
        throw new Error("Unexpected value in array");
      }
      return output;
    }, [] as Array<DataVariableType | Dice>);
  }
  // condense the collection into a single item.
  toSingleItem(): Dice | DataVariableType {
    // throw new Error("TODO, collection toItem");
    const result = add(...this.flatten().map((val) => new DataItem(val)));
    if (result.tag === "collection") {
      throw new Error("something went wrong adding");
    }
    return result.data as Dice | DataVariableType;
  }
  // MaybeFn, array style forEach to iterate through the items?
  // abstract forEach(callbackFn: (item: DataItem, index: number) => void): void;
}
