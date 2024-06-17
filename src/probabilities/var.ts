import type { Variable, VariableInput } from "./types";

export function isVariable(input: unknown): input is Variable {
  return typeof input === "number";
}
export function isVariableInput(input: unknown): input is VariableInput {
  return isVariable(input) || typeof input === "string";
}
export function isValidVariableInput(input: unknown): input is VariableInput {
  return (
    isVariable(input) || (typeof input === "string" && /^\d+$/.test(input))
  );
}

export function asVariable(input: VariableInput): Variable {
  const output: Variable = typeof input === "string" ? parseInt(input) : input;
  if (isNaN(output)) {
    throw new Error(`Invalid input. ${input} parsed to NaN`);
  }
  return output;
}
