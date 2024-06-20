import { isDiceArrayType, isDiceType, isVarType } from "./type_check";
import { getAsType } from "./type_convert";
import {
  VarType,
  DiceType,
  DiceArrayType,
  VarEntry,
  RangeInput,
  DataTypeInput,
  FnDataTypeKey,
  FnDataType,
} from "./types";
import { simplifyDice } from "./utils/simplify_dice";

// take any inputs that are usable as a dice.
export function createSingleDice(input: DataTypeInput<"dice">): DiceType {
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

// if the input is not an array, wrap it into an array. Will create an array of dice. Some types overlap, so need to be careul about that.
export function createDiceArray(input: DataTypeInput<"array">): DiceArrayType {
  let inputVal = input;
  if (isDiceType(inputVal)) {
    console.warn(
      "This input for an array is valid as an array input, or could be a single valid dice. and as such could have some unexpected behavior."
    );
    inputVal = [inputVal];
  }
  if (!Array.isArray(inputVal)) {
    inputVal = [inputVal];
  }
  // check for types that can only be a single dice, and wrap them.
  return inputVal.reduce<DiceArrayType>((output, val) => {
    // existing dice array types will be spread into the output.
    if (isDiceArrayType(val)) {
      return output.concat(val);
    }
    return [...output, createSingleDice(val)];
  }, []);
}
// will expect a specific set of inputs based on k
export function createAsType<K extends FnDataTypeKey>(
  key: K,
  input: DataTypeInput<K>
): FnDataType<K>;
export function createAsType(
  key: FnDataTypeKey,
  input: DataTypeInput
): FnDataType {
  // first check for the types that are already valid
  let value: FnDataType;
  if (isVarType(input)) {
    value = input;
  } else if (isDiceType(input)) {
    value = input;
  } else if (isDiceArrayType(input)) {
    value = input;
  } else {
    // what is left are types that should safely compress down from an array
    // NOTE: only potential issue between dice + array inputs is that a single valid dice is a valid input for an array
    value = createDiceArray(input);
  }
  // value is created as the input type or an array, to be converted to the desired type
  // Doing this instead of checking for specific input types to avoid needing to simplify the inputs becasue many inputs besides a single variable could create a value that's compatible as a lower type. (simple example [[[5,1]]] would only be valid to create a diceArray, but is valid to convert to a variable )
  return getAsType(key, value);
}
