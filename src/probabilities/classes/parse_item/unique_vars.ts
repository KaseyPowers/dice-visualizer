import type { DataEntryType, DataVariableType } from "@/probabilities/types";
import { isDataVariableType } from "@/probabilities/types";

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
// Combine above logics into one function
export function toUniqueVarEntries(
  input: Array<DataVariableType | DataEntryType>
): Array<DataEntryType> {
  let outputEntries: DataEntryType[] = [];
  let varSet = new Set<DataVariableType>();
  let isUnique = input.every((part) => {
    const asEntry: DataEntryType = isDataVariableType(part) ? [part, 1] : part;
    // once a duplicate is found, return
    if (varSet.has(asEntry[0])) {
      return false;
    }
    // otherwise, add to the output array and set tracking duplicates.
    outputEntries.push(asEntry);
    varSet.add(asEntry[0]);
    return true;
  });
  // if all unique, the outputEntries is ready to go
  if (isUnique) {
    return outputEntries;
  }
  // otherwise, the outputEntries is unique and can be made into a map to start the process
  const asMap = new Map(outputEntries);
  // now iterate through the rest of the input values and add to map
  for (let i = outputEntries.length; i < input.length; i += 1) {
    const inputVal = input[i];
    const [value, count] = isDataVariableType(inputVal)
      ? [inputVal, 1]
      : inputVal;
    asMap.set(value, (asMap.get(value) ?? 0) + count);
  }
  return Array.from(asMap);
}
