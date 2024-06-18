import type { DiceType, VarEntry } from "../types";

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
