import type { DataVariableType, EntryType } from "../types";

import { Dice } from "./dice";

// Holds multiple Dice/Variables - Could mix this into DataItem container with it's `toSingleItem` overlapping the getClosestDataType, but I suspect there will be extra features to containers that will be added later
export class Collection {
  static assertCollection(input: unknown): asserts input is Collection {
    if (!(input instanceof Collection)) {
      throw new Error("Asserted value was a Collection instance");
    }
  }
  constructor(
    private readonly data: Array<DataVariableType | Dice | EntryType<Dice>>
  ) {}
  // condense the collection into a single item.
  toSingleItem(): Dice | DataVariableType {
    throw new Error("TODO, collection toItem");
  }
  // MaybeFn, array style forEach to iterate through the items?
  // abstract forEach(callbackFn: (item: DataItem, index: number) => void): void;
}
