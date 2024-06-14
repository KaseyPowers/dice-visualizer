import type { DataEntryType, DataVariableType } from "../types";
import { isDataEntryArr, isDataVariableType } from "../types";

export function varsAreUnique(
  input: Array<DataEntryType | DataVariableType>
): boolean {
  let varSet = new Set<DataVariableType>();
  return input.every((part) => {
    // get value
    const value = isDataVariableType(part) ? part : part[0];
    // if value already in set, return false
    if (varSet.has(value)) {
      return false;
    }
    // otherwise add and continue
    varSet.add(value);
    return true;
  });
}

export function makeUniqueVars(
  input: Array<DataVariableType | DataEntryType>
): Array<DataEntryType> {
  const asMap = new Map<DataVariableType, number>();
  // go through each entry, adding it to the map, will add counts as we go.
  input.forEach((item) => {
    const [val, count] = isDataVariableType(item) ? [item, 1] : item;
    asMap.set(val, (asMap.get(val) ?? 0) + count);
  });
  return Array.from(asMap);
}

// Did some quick performance testing, I think that checking for uniqueness first will save time overall
// Will make sure that the entries have unique vals. Doesn't check if neccisary first. Also adding validate flag since it makes sense to check if counts are valid while already grabbing the count
export function toUniqueVars<T extends DataVariableType | DataEntryType>(
  input: Array<T>
): Array<T> | Array<DataEntryType> {
  // skip if already unique
  if (varsAreUnique(input)) {
    return input;
  }
  return makeUniqueVars(input);
}

export function toUniqueVarEntries(
  input: Array<DataVariableType | DataEntryType>
): Array<DataEntryType> {
  // Duplicate this logic so that I can verify input type while I'm at it.
  let varSet = new Set<DataVariableType>();
  let isEntryArr = true;
  const inputUnique = input.every((part) => {
    let value;
    if (isDataVariableType(part)) {
      isEntryArr = false;
      value = part;
    } else {
      value = part[0];
    }
    if (varSet.has(value)) {
      return false;
    }
    varSet.add(value);
    return true;
  });
  if (inputUnique) {
    if (isEntryArr) {
      return input as DataEntryType[];
    }
    return input.map((part) => (isDataVariableType(part) ? [part, 1] : part));
  }
  return makeUniqueVars(input);
}
