import type { DataVariableType, DataEntryType } from "../types";
import type { DataTagType } from "../classes";
import type { OutputType } from "./types";

import { isDataVariableType } from "../types";
import { DataItem, Collection } from "../classes";

/**
 * Note about flattening outputs:
 * I think there is a potential to flatten containers differently than other types.
 * Using the same/similar logic as combining a single set of entries, we could combine each value inside the container?
 * TBD if it's worth trying to do
 */

// Simple logic here will flatten any collections to a single value as it puts them together
function flattenToDataEntries(input: Array<OutputType>): DataEntryType[] {
  const output: DataEntryType[] = [];
  // store the total multiplier for remaining inputs
  let mult = 1;
  input.forEach((inputVal) => {
    let [item, count] = inputVal;
    if (count < 1) {
      throw new Error("Expected count >= 1");
    }
    if (item instanceof Collection) {
      item = item.toSingleItem();
    }
    let innerCount: number;
    let innerEntries: ReadonlyArray<DataEntryType>;
    if (isDataVariableType(item)) {
      innerCount = 1;
      innerEntries = [[item, 1]];
    } else {
      innerEntries = item.entries;
      innerCount = item.totalCount;
    }
    if (innerCount < 1) {
      throw new Error("Expected a count >= 1");
    }

    const currentMultiplier = mult;
    // Now the innerCount + innerEntries is set, use
    if (innerCount > 1) {
      output.forEach((entry) => {
        entry[1] *= innerCount;
      });
      mult *= innerCount;
    }
    innerEntries.forEach((entry) => {
      output.push([entry[0], entry[1] * count * currentMultiplier]);
    });
  });
  return output;
}

// take output array generated, return the desired DataItem
export default function getOutputItem(
  outputs: Array<OutputType>,
  target: DataTagType
) {
  if (outputs.length < 1) {
    throw new Error("No outputs?");
  }
  if (outputs.length === 1) {
    // simple to return a single value as is
    return new DataItem(target, outputs[0][0]);
  }
  // we can only hit this point if there were dice values for var inputs. So we need to make sure the output type is also moved up from var.
  const expectedTarget = target === "var" ? "dice" : target;
  // Complex the results down
  // NOTE: this only converts to an entry, so even if target is collection and all outputs are a collection, the output would be a single var/dice in an array.
  return DataItem.getItem(expectedTarget, flattenToDataEntries(outputs));
}
