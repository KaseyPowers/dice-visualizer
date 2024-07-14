import { arraysEqual, type EqualityFn } from "@/utils/equality_helpers";
import {
  DataTypeOptions,
  type DiceArrayType,
  type DiceType,
  type FnDataType,
  type VarEntry,
  type VarType,
} from "../types";
import {
  getClosestType,
  getTypeKey,
  getAsType,
  assertKeyType,
} from "../type_convert";

export function diceTotalCount(input: DiceType): number {
  return input.reduce((sum, entry) => sum + entry[1], 0);
}
// function to sort in descending order
function diceSorter(a: VarEntry, b: VarEntry): number {
  return b[0] - a[0];
}
export function sortDice(input: DiceType): void {
  input.sort(diceSorter);
}
export function toSortedDice(input: DiceType): DiceType {
  return input.toSorted(diceSorter);
}

export const diceEqual = (a: DiceType, b: DiceType) =>
  arraysEqual(a, b, arraysEqual as EqualityFn<VarEntry>);

export const diceArrayEqual = (a: DiceArrayType, b: DiceArrayType) =>
  arraysEqual(a, b, diceEqual);

export function dataTypeEqual(a: FnDataType, b: FnDataType): boolean {
  let compareA = a;
  let compareB = b;
  let aKey = getTypeKey(compareA);
  let bKey = getTypeKey(compareB);
  // if the keys aren't equal, try to get both types to match
  if (aKey !== bKey) {
    const largestKey =
      DataTypeOptions.indexOf(aKey) > DataTypeOptions.indexOf(bKey) ?
        aKey
      : bKey;
    if (largestKey === "var") {
      throw new Error(
        "This shouldn't be possible, if they aren't equal, one key must have been 'larger' than var",
      );
    }
    compareA = getAsType(largestKey, a);
    compareB = getAsType(largestKey, b);
    assertKeyType(largestKey, compareA);
    assertKeyType(largestKey, compareB);
  }

  if (aKey === "var") {
    return compareA === compareB;
  }
  if (aKey === "dice") {
    assertKeyType(aKey, compareA);
    assertKeyType(aKey, compareB);
    return diceEqual(compareA, compareB);
  }
  if (aKey === "array") {
    assertKeyType(aKey, compareA);
    assertKeyType(aKey, compareB);
    return diceArrayEqual(compareA, compareB);
  }
  throw new Error(
    `Somethign wrong, expected aKey to have been one of the expected values, but got ${aKey}`,
  );
}

const multilineThreshold = 15;
export function diceString(input: DiceType) {
  const asStrings = input.map((ent) => `[${ent[0]}-${ent[1]}]`);
  if (input.length >= multilineThreshold) {
    return ["[", ...asStrings].join("\n  ") + "\n]";
  }
  return `[${asStrings.join(", ")}]`;
}
