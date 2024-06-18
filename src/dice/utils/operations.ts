import { assertType, isDiceArrayType } from "../type_check";
import { asDice } from "../type_convert";
import type { VarType, DiceType, FnDataType, DiceArrayType } from "../types";
import { simplifyDice } from "./simplify_dice";

export type OperationFn = (a: VarType, b: VarType) => VarType;
// also use to define order of operations
export const AllAvailableOperations = ["*", "/", "%", "+", "-"] as const;
export type OperationKeys = (typeof AllAvailableOperations)[number];
const predefinedOperations = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => Math.floor(a / b),
  "%": (a, b) => a % b,
} as const satisfies Record<OperationKeys, OperationFn>;

export function diceOperation(
  fn: OperationFn | OperationKeys,
  ...items: FnDataType[]
): FnDataType {
  if (items.length < 1) {
    throw new Error("Not enough inputs to work with");
  }
  const opFn = typeof fn === "string" ? predefinedOperations[fn] : fn;
  if (!opFn) {
    throw new Error("Missing function definition");
  }

  // return items.slice(1).reduce<DiceType>((previous, next) => {
  //   const output: DiceType = [];
  //   const nextDice = asDice(next);
  //   previous.forEach(([value, count]) => {
  //     nextDice.forEach(([nextVal, nextCount]) => {
  //       output.push([opFn(value, nextVal), count * nextCount]);
  //     });
  //   });
  //   // sipmlify each time to keep numbers in control.
  //   // If performance optomizing, could be worth comparing closer with variations that do less between and simplify at the end
  //   return simplifyDice(output);
  // }, asDice(items[0]));

  function betweenDice(a: DiceType, b: DiceType): DiceType {
    const output: DiceType = [];
    a.forEach(([aVal, aCount]) => {
      b.forEach(([bVal, bCount]) => {
        output.push([opFn(aVal, bVal), aCount * bCount]);
      });
    });
    return simplifyDice(output);
  }
  const first = items[0];
  let isArray = isDiceArrayType(first);
  return items.slice(1).reduce<FnDataType>((previous, next) => {
    // if previous is an array, expect second value to be a dice and applied ot each item in the array
    if (isArray) {
      assertType(previous, isDiceArrayType);
      const nextDice = asDice(next);
      return previous.map((prevDice) => betweenDice(prevDice, nextDice));
    }
    if (isDiceArrayType(next)) {
      // previous coul be a variable so just to be safe.
      const prevDice = asDice(previous);
      isArray = true;
      return next.map((nextDice) => betweenDice(prevDice, nextDice));
    }
    return betweenDice(asDice(previous), asDice(next));
  }, first);
}
type PredefinedOperationFn = (...items: FnDataType[]) => DiceType;
export const addDice: PredefinedOperationFn = (...items) =>
  diceOperation("+", ...items);
export const subtractDice: PredefinedOperationFn = (...items) =>
  diceOperation("-", ...items);
export const multiplyDice: PredefinedOperationFn = (...items) =>
  diceOperation("*", ...items);
export const divideDice: PredefinedOperationFn = (...items) =>
  diceOperation("/", ...items);
export const modDice: PredefinedOperationFn = (...items) =>
  diceOperation("%", ...items);

export function fnTypeOperation(
  fn: OperationFn | OperationKeys,
  ...items: FnDataType[]
) {}
