import { isDiceArrayType, isDiceType, isVarType } from "./type_check";
import {
  VarType,
  DiceType,
  DiceArrayType,
  VarEntry,
  RangeInput,
} from "./types";
import { simplifyDice } from "./utils/simplify_dice";

// types that can only refer to a single dice item
export type OnlySingleDiceInputs = VarType | RangeInput;

export type CanBeDiceInputs = OnlySingleDiceInputs | Array<VarType> | DiceType;
// take any inputs that are usable as a dice.
export function createSingleDice(input: CanBeDiceInputs): DiceType {
  let output = input;
  if (isVarType(output)) {
    output = [output];
  }
  if (!Array.isArray(output)) {
    const { min = 1, max } = output;
    if (max < min) {
      throw new Error("Invalid input, max should be >= min (defaults 1)");
    }
    const nextOutput: number[] = [];
    for (let i = min; i <= max; i += 1) {
      nextOutput.push(i);
    }
    output = nextOutput;
  }
  if (!isDiceType(output)) {
    output = output.map<VarEntry>((val) => [val, 1]);
  }
  return simplifyDice(output);
}

export type AllInputs =
  | CanBeDiceInputs
  | Array<CanBeDiceInputs | DiceArrayType>;

// if the input is not an array, wrap it into an array. Will create an array of dice. Some types overlap, so need to be careul about that.
export function createDiceArray(input: AllInputs): DiceArrayType {
  if (isDiceType(input)) {
    console.warn(
      "This input for an array is valid as single dice. this can result in unexpected behavior."
    );
  }
  // check for types that can only be a single dice, and wrap them.
  return (Array.isArray(input) ? input : [input]).reduce<DiceArrayType>(
    (output, val) => {
      if (isDiceArrayType(val)) {
        return output.concat(val);
      }
      return [...output, createSingleDice(val)];
    },
    []
  );
}
