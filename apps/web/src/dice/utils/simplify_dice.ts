import type { VarType, DiceType } from "../types";
import { array_gcd } from "@/utils/gcd";
import { sortDice } from "./utils";
// to help simplify dice when not wanting to fully deal with gcd and such yet
export function makeDiceUnique(input: DiceType): DiceType {
  if (new Set(input.map((ent) => ent[0])).size === input.length) {
    return input;
  }
  const asMap = new Map<VarType, number>();
  input.forEach(([val, count]) => {
    asMap.set(val, (asMap.get(val) ?? 0) + count);
  });
  return Array.from(asMap);
}
export function simplifyDice(input: DiceType): DiceType {
  if (input.length <= 0) {
    throw new Error("Emtpy dice not allowed");
  }
  let failedVal: number;
  if (
    input.some((ent) => {
      const result = ent[1] < 1 || !Number.isSafeInteger(ent[1]);
      if (result) {
        failedVal = ent[1];
      }
      return result;
    })
  ) {
    throw new Error(
      `Invalid entry in dice, expect count to be a safe Int  >= 1, received: ${failedVal!}`,
    );
  }
  let uniqueIndex = 0;
  const trackVals = new Set<VarType>();
  let sameCount = true;
  let isUnique = input.every((entry, index) => {
    // we want last index tested, since input.slice(0, index) is exclusive of that failed index
    uniqueIndex = index;
    if (trackVals.has(entry[0])) {
      return false;
    }

    trackVals.add(entry[0]);
    sameCount = sameCount && (index === 0 || input[index - 1][1] === entry[1]);
    return true;
  });

  if (isUnique && sameCount) {
    // we know all entries match, so can end early.
    // if the first entry's count is 1, we can even skip that map
    if (input[0][1] === 1) {
      return input;
    }
    // if all the same value, gcd logic will just result in the same thing with extra steps.
    return input.map((ent) => [ent[0], 1]);
  }
  let output = input;
  // if not unique, flatten unique values in output
  if (!isUnique) {
    // use uniqueIndex to start the map with all (known) unique values defined already
    const asMap = new Map(input.slice(0, uniqueIndex));
    input.slice(uniqueIndex).forEach(([value, count]) => {
      asMap.set(value, (asMap.get(value) ?? 0) + count);
    });
    output = Array.from(asMap);
    // quickly check if all counts are same, then repeat logic from isUnique and same count.
    if (
      output.every(
        (ent, index, arr) => index === 0 || ent[1] === arr[index - 1][1],
      )
    ) {
      if (output[0][1] === 1) {
        return output;
      }
      return output.map((ent) => [ent[0], 1]);
    }
  }
  if (output.length < 1) {
    throw new Error("Somehow have an empty array for output");
  }
  const gcd = array_gcd(output.map((ent) => ent[1]));
  if (gcd > 1) {
    output = output.map(([val, count]) => {
      if (count % gcd !== 0) {
        throw new Error(`Invalid gcd, expected ${count}%${gcd} to be 0`);
      }
      return [val, count / gcd];
    });
  }
  sortDice(output);
  return output;
}
