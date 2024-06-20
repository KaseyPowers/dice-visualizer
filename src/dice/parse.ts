import type {
  DiceArrayType,
  DiceType,
  FnDataType,
  InnerDiceArrayInput,
  VarType,
} from "./types";
import { createDiceArray, createSingleDice } from "./create";
import { isDiceType, isFnDataType, isVarType } from "./type_check";
import { asDice, asVar } from "./type_convert";
import {
  AllAvailableOperations,
  OperationKeys,
  diceOperation,
} from "./functions/operations";
import { arraysEqual } from "@/utils/equality_helpers";

/**
 * parsing rules:
 * operations: add,subtract,multiply,devide,mod
 * dice: <number?>d<stuff>
 * array: [numbers,]
 * range: [number..number]
 */
type ParseVals = string | FnDataType;

// modify inputs array
function processParenthesis(values: Array<ParseVals>): void {
  if (values.includes("(") || values.includes(")")) {
    const openCount = values.filter((val) => val === "(").length;
    const closeCount = values.filter((val) => val === ")").length;
    if (openCount !== closeCount) {
      throw new Error("Invalid parenthesis, more of one than the other");
    }
    while (values.includes("(")) {
      const start = values.indexOf("(");

      let count = 1;
      let end = start;
      while (end < values.length && count > 0) {
        end++;
        const val = values[end];
        if (val === "(") {
          count++;
        } else if (val === ")") {
          count--;
        }
      }
      if (count > 0) {
        throw new Error("Couln't find closing parenthesis");
      }
      // grab values between parenthesis
      const result = processValues(values.slice(start + 1, end));
      // replace the middle and the surrounding parenthesis with the result
      values.splice(
        start,
        1 + (end - start),
        result
        // ...(result ? [result] : [])
      );
    }
    // there shouldn't be any closing parenthesis left
    if (values.includes(")")) {
      throw new Error("There shouldn't be any of these left.");
    }
  }
}

// modify inputs array
function processAllArrays(values: Array<ParseVals>): void {
  // next group type, [] - for these, we will want to start with the smallest values if they are nested
  if (values.includes("[") || values.includes("]")) {
    const openCount = values.filter((val) => val === "[").length;
    const closeCount = values.filter((val) => val === "]").length;
    if (openCount !== closeCount) {
      throw new Error("Invalid array brackets, more of one than the other");
    }
    // Looking for innermost first, so starting with ] bracket

    while (values.includes("]")) {
      // first end bracket
      const end = values.indexOf("]");
      const start = values.lastIndexOf("[", end);
      // grab values between brackets
      const result = processArray(values.slice(start + 1, end));
      // replace the middle and the surrounding brackets with the result
      values.splice(start, 1 + (end - start), result);
    }
    // after removing all "]", make sure there aren't any "[" lefover
    if (values.includes("[")) {
      throw new Error(
        "Error processing brackets, there are opening brackets left over"
      );
    }
  }
}

function processArray(inputs: Array<ParseVals>): DiceArrayType {
  if (inputs.includes("[") || inputs.includes("]")) {
    throw new Error("Always parse inner arrays first");
  }
  const values: Array<InnerDiceArrayInput> = [];
  const currentInputs = [...inputs];
  while (currentInputs.length > 0) {
    const nextCommaIndex = currentInputs.indexOf(",");
    let toProcess: Array<ParseVals>;
    // if no comma, rest of inputs should be last value
    if (nextCommaIndex < 0) {
      toProcess = currentInputs.splice(0, currentInputs.length);
      //   values.push(processArrayContents(currentInputs));
      //   currentInputs = [];
    } else {
      const removed = currentInputs.splice(0, nextCommaIndex + 1);
      toProcess = removed.slice(0, -1);
    }
    if (toProcess.length > 0) {
      values.push(processArrayContents(toProcess));
    } else {
      console.warn("got an empty array to process, skipping");
    }
  }
  if (values.length <= 0) {
    throw new Error("Don't support empty arrays");
  }
  return createDiceArray(values);
}
// special logic for processing each values inside [] brackets, just adding special logic for ranges and making sure there aren't awkward situations when parsing a value into an array.
function processArrayContents(inputs: Array<ParseVals>): InnerDiceArrayInput {
  // first checking for range start".."end
  // checking for any "." values, then verify a ".." value
  const withDot = inputs.filter(
    (val) => typeof val === "string" && val.includes(".")
  );
  if (withDot.length > 0) {
    if (withDot.length !== 1 || withDot[0] !== "..") {
      throw new Error(
        'incorrect input format, expected array item to have a single ".." and no other inputs with "." inside '
      );
    }
    const rangeMiddle = inputs.indexOf("..");
    let leftSide = asVar(processValues(inputs.slice(0, rangeMiddle)));
    let rightSide = asVar(processValues(inputs.slice(rangeMiddle + 1)));
    // still using varType to ignore 0 as a falsy number
    if (!isVarType(leftSide) || !isVarType(rightSide)) {
      throw new Error(
        "invalid input, left and right side of range epxected to be numbers"
      );
    }
    // if equal, just return an array with the one value
    let values: number[] = [];
    if (leftSide === rightSide) {
      values.push(leftSide);
    } else if (leftSide < rightSide) {
      for (let i = leftSide; i <= rightSide; i++) {
        values.push(i);
      }
    } else if (rightSide < leftSide) {
      for (let i = leftSide; i >= rightSide; i--) {
        values.push(i);
      }
    }
    // making this into an array, so that it is spread into the final array.
    return createDiceArray(values);
  }
  // if not range, expect it to process into a single value
  const result = processValues(inputs);
  if (typeof result === "string") {
    throw new Error(
      `in array, got a value processed to ${result}, this is not expected or handled yet`
    );
  }
  if (typeof result === "undefined") {
    throw new Error(
      "Processing array item, received undefined, ignore or throw error?"
    );
  }
  return result;
}

// look for the `d` notations
function processDice(values: Array<ParseVals>): void {
  // used for getting the values left+right of a "d"
  function getValAt(index: number): undefined | FnDataType {
    if (index >= 0 && index < values.length) {
      const valAt = values[index];
      if (typeof valAt !== "string") {
        return valAt;
      } else if (!AllAvailableOperations.includes(valAt as OperationKeys)) {
        throw new Error(
          `The only valid values before "d" are a number or operation, but found ${valAt}`
        );
      }
      // At this point, we expect every value to be a "d", operation or value, so only throw an error if 2 "d"s next to each other
      // } else if (valAt !== " ") {
      //   throw new Error(
      //     "Expected to find an empty space or a usable value at index"
      //   );
      // }
    }
  }
  while (values.includes("d")) {
    const dIndex = values.indexOf("d");
    let dCount: VarType | undefined = undefined;
    const dCountVal = getValAt(dIndex - 1);
    if (typeof dCountVal !== "undefined") {
      dCount = asVar(dCountVal);
      if (!isVarType(dCount)) {
        throw new Error(
          "value before d in dice notation expected to be usable as a single number"
        );
      }
      if (dCount < 1) {
        throw new Error("Expected the dice count to be a positive value");
      }
    }
    const dValue = getValAt(dIndex + 1);
    if (typeof dValue === "undefined") {
      throw new Error(
        'Expected a value immediately after "d", is there an accidental space?'
      );
    }
    let diceValue: DiceType;
    // a single number is used as a max range
    if (isVarType(dValue)) {
      diceValue = createSingleDice({ max: dValue });
    } else if (isDiceType(dValue)) {
      diceValue = dValue;
    } else {
      // it's an array, if every value inside can be made a variable, convert.
      const vars = dValue.map((item) => asVar(item));
      // if it was successful, use the variables into a single dice
      if (vars.every(isVarType)) {
        diceValue = createSingleDice(vars);
      } else {
        diceValue = asDice(dValue);
      }
    }
    const endIndex = dIndex + 1;
    const startIndex = dIndex - (dCountVal ? 1 : 0);
    // if there is a count, create an array of the dice with that many values, and run through createDiceArray to make sure it's valid.
    const replaceValue = dCountVal
      ? createDiceArray(new Array(dCount).fill(diceValue))
      : diceValue;
    // replace the middle and the surrounding parenthesis with the result
    values.splice(startIndex, 1 + (endIndex - startIndex), replaceValue);
  }
}
// combine the strings to make sure they don't prefer operand over l->r when it shouldn't
const operandOrder = ["*/%", "+-"];

type TreeNodes =
  | FnDataType
  | { op: OperationKeys; left: TreeNodes; right: TreeNodes };
function processOperations(values: Array<ParseVals>): FnDataType {
  const validInput = values.every((val, index) => {
    return index % 2 === 0
      ? isFnDataType(val)
      : typeof val === "string" &&
          AllAvailableOperations.includes(val as OperationKeys);
  });
  if (!validInput) {
    throw new Error("Expected values to be alternating value and operation");
  }
  let index = 0;
  function currentValue(): undefined | ParseVals {
    if (index < values.length) {
      return values[index];
    }
  }
  function getTreeNode(opIndex = operandOrder.length - 1): TreeNodes {
    if (opIndex < 0) {
      const value = values[index];
      if (!isFnDataType(value)) {
        throw new Error("Something wrong, expected variable");
      }
      index++;
      return value;
    }
    const ops = operandOrder[opIndex];
    let output = getTreeNode(opIndex - 1);
    let atIndex = currentValue();
    while (typeof atIndex === "string" && ops.includes(atIndex)) {
      index++;
      const right = getTreeNode(opIndex - 1);
      output = { op: atIndex as OperationKeys, left: output, right };
      atIndex = currentValue();
    }

    return output;
  }

  const asTree = getTreeNode();

  function processNode(input: TreeNodes): FnDataType {
    if (isFnDataType(input)) {
      return input;
    }
    return diceOperation(
      input.op,
      processNode(input.left),
      processNode(input.right)
    );
  }
  return processNode(asTree);
}
// all valid strings
type ExpectedStringArrayValuesType = string | RegExp;
const ParenthesisValues: ExpectedStringArrayValuesType[] = ["(", ")"] as const;
const ArrayValues: ExpectedStringArrayValuesType[] = [
  "[",
  "]",
  ",",
  /\.+/,
] as const;
const AllExpectedStrings: ExpectedStringArrayValuesType[] = [
  ...AllAvailableOperations,
  ...ParenthesisValues,
  ...ArrayValues,
  "d",
  // " ",
] as const;

function validateExpectedStrings(
  inputs: Array<ParseVals>,
  expected: ExpectedStringArrayValuesType[]
) {
  // return the first invalid value index, ideally will return -1
  const foundInvalid = inputs.findIndex(
    (val) =>
      typeof val === "string" &&
      !expected.some((exp) =>
        typeof exp === "string" ? exp === val : exp.test(val)
      )
  );
  if (foundInvalid >= 0) {
    throw new Error(
      `found unexpected string value in array: ${inputs[foundInvalid]}`
    );
  }
}
function processValues(inputs: Array<ParseVals>): FnDataType {
  if (inputs.length <= 0) {
    throw new Error("Unexpected empty array");
  }
  let values = [...inputs];
  let expectedStrings = [...AllExpectedStrings];
  validateExpectedStrings(values, expectedStrings);

  // handle groups first
  // handle parenthesis
  processParenthesis(values);
  // after parenthesis, filter them out of expected strings
  expectedStrings = expectedStrings.filter(
    (val) => !ParenthesisValues.includes(val)
  );
  validateExpectedStrings(values, expectedStrings);
  // handle all array values
  processAllArrays(values);
  expectedStrings = expectedStrings.filter((val) => !ArrayValues.includes(val));
  validateExpectedStrings(values, expectedStrings);
  // all that remains should be: numbers, "d", spaces, and *operations*
  processDice(values);
  // now that dice are processed, we can
  expectedStrings = expectedStrings.filter((val) => val !== "d");
  if (!arraysEqual(expectedStrings, AllAvailableOperations)) {
    throw new Error(
      "Expected strings array should only have operations at this point"
    );
  }
  validateExpectedStrings(values, expectedStrings);

  return processOperations(values);
}

// const splitRegex = /(?:(\d+|\s+|[d,\[\]\(\)]))/
const splitRegex = /(?:(-?\d+)|([d,\[\]\(\)]))/;
// split string completely, then keep useful characters and combine values back together
function splitString(input: string) {
  // this will split, keeping numbers grouped, seperating d from neighbors, and spaces in the array. Afterwards trim, meaning all values will be numbers, "", or other
  return input
    .split(splitRegex)
    .map((val) => val && val.trim())
    .filter(Boolean)
    .map((val) => {
      if (/^-?\d+$/.test(val)) {
        const result = parseInt(val);
        if (isNaN(result)) {
          throw new Error(`something wrong parsing a number: ${val}`);
        }
        return result;
      }
      // keep spaces as a single space now
      return val;
    });
}

export default function parseString(input: string) {
  const split = splitString(input.toLowerCase());
  return processValues(split);
}
