import type { Variable, VariableEntry } from "./types";
import { isVariable } from "./var";

// Combine above logics into one function
export function toUniqueVarEntries(
  input: Array<Variable | VariableEntry>
): Array<VariableEntry> {
  let outputEntries: VariableEntry[] = [];
  let varSet = new Set<Variable>();
  let isUnique = input.every((part) => {
    const asEntry: VariableEntry = isVariable(part) ? [part, 1] : part;
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
    const [value, count] = isVariable(inputVal) ? [inputVal, 1] : inputVal;
    asMap.set(value, (asMap.get(value) ?? 0) + count);
  }
  return Array.from(asMap);
}
