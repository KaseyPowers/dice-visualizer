import type { Probability, ProbabilityInputType } from "./prob";
import type { ProbabilityArray, ProbabilityArrayInputType } from "./prob_arr";

export const DataTagOptions = ["var", "dice", "array"] as const;
export type DataTagType = (typeof DataTagOptions)[number];
export type ItemType = Variable | Probability | ProbabilityArray;

export type Variable = number;
export type VariableInput = number | string;

export type WithVariableInputs<T> = T extends Variable
  ? T | VariableInput
  : T extends Array<unknown> | object
  ? {
      [K in keyof T]: WithVariableInputs<T[K]>;
    }
  : T;

export type EntryType<T> = [value: T, count: Variable];

export type VariableEntry = EntryType<Variable>;
export type VariableEntryArray = Array<VariableEntry>;

export type ProbabilityValue = Probability | ProbabilityArray;

export type DataTagValue<Tag extends DataTagType> = Tag extends DataTagType
  ? "array" extends Tag
    ? ProbabilityArray
    : "dice" extends Tag
    ? Probability
    : "var" extends Tag
    ? Variable
    : never
  : never;

export type OutputTagValue<Tag extends DataTagType = DataTagType> =
  Tag extends DataTagType
    ? "array" extends Tag
      ? ProbabilityArray | ProbabilityArrayInputType
      : "dice" extends Tag
      ? Probability | ProbabilityInputType
      : "var" extends Tag
      ? VariableInput
      : never
    : never;
