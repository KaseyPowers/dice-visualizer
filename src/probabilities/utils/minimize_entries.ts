import { dice_gcd } from "./dice_gcd";
import { DataVariableType, DataEntryType, DataRangeType } from "./types";
import { dataRangeTotal } from "./utilities";

// Will make sure that the entries have unique vals. Doesn't check if neccisary first. Also adding validate flag since it makes sense to check if counts are valid while already grabbing the count
export function makeVarsUnique(input: DataEntryType[]): DataEntryType[] {
  const asMap = new Map<DataVariableType, number>();
  // go through each entry, adding it to the map, will add counts as we go.
  input.forEach(([val, count]) => {
    asMap.set(val, (asMap.get(val) ?? 0) + count);
  });
  return Array.from(asMap);
}

// This assumes we have a final set of entries, and will make sure we use the smallest counts possible while retaining the probabilities of each
export function minimizeCounts(input: DataEntryType[]): DataEntryType[] {
  const gcd = dice_gcd(input.map((entry) => entry[1]));
  return gcd > 1 ? input.map(([val, count]) => [val, count / gcd]) : input;
}

// assuming we have valid+unique inputs (but don't need them to have count simplified ), will return the simpelist representation.
// Having the preferred input means we can keep the logic inside simple with less checks
export function minimizeEntries(
  input: DataEntryType[]
):
  | DataVariableType
  | Array<DataVariableType>
  | DataRangeType
  | Array<DataEntryType> {
  const entries = makeVarsUnique(input);
  // 1 item is just a single variable
  if (entries.length === 1) {
    return entries[0][0];
  }
  // This logic checks if the entries can be converted to an array. While doing so, builds the array and the min/max range.
  let arrayValid = true;
  const range: DataRangeType = { min: entries[0][0], max: entries[0][0] };
  const arrayOutput: Array<DataVariableType> = [entries[0][0]];
  // logic for adding to the array and comparing+updating the range
  const addVal = (val: DataVariableType) => {
    arrayOutput.push(val);
    if (val < range.min) {
      range.min = val;
    }
    if (val > range.max) {
      range.max = val;
    }
  };
  for (let i = 1; i < entries.length && arrayValid; i += 1) {
    if (entries[i][1] !== entries[i - 1][1]) {
      arrayValid = false;
    } else {
      addVal(entries[i][0]);
    }
  }
  // if valid as an array, check if valid as a range
  if (arrayValid) {
    if (entries.length === dataRangeTotal(range)) {
      // need to return as an object otherwise won't be able to distinqush between a range and an array with 2 values
      return range;
    }
    return arrayOutput;
  }
  // if not valid as an array, keep as entries but make sure the counts are simplified to lowest possible values
  return minimizeCounts(entries);
}
