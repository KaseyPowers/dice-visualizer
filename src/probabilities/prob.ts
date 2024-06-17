import { GetterFn } from "@/utils/types";
import { getOnce } from "@/utils/getter_helpers";
import { toUniqueVarEntries } from "./unique_vars";
import { minimizeEntryCounts } from "./dice_gcd";
import { EqualityFn, arraysEqual } from "@/utils/equality_helpers";

import type {
  Variable,
  VariableEntry,
  VariableEntryArray,
  WithVariableInputs,
  EntryType,
} from "./types";
import { asVariable, isVariable, isVariableInput } from "./var";

type BaseInputType =
  | number
  | {
      min?: number;
      max: number;
    }
  | Array<number | EntryType<number>>;

export type ProbabilityInputType = WithVariableInputs<BaseInputType>;

export const OperationTypeOptions = ["+", "-", "*", "/", "%"] as const;
export type OperationTypes = (typeof OperationTypeOptions)[number];
const operationFunctions: Record<
  OperationTypes,
  (a: number, b: number) => number
> = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => Math.floor(a / b),
  "%": (a, b) => a % b,
};

export type FlattanableOutputValue =
  | Probability
  | Variable
  | VariableEntryArray;
// export class Probability implements OperationFunctions {
export class Probability {
  private readonly data: VariableEntryArray;

  static isEqual(a: Probability, b: Probability) {
    return arraysEqual(
      a.entries,
      b.entries,
      arraysEqual as EqualityFn<VariableEntry>
    );
  }
  equals(other: Probability) {
    return Probability.isEqual(this, other);
  }

  static operation(
    op: OperationTypes,
    ...items: [a: Probability, b: Probability, ...others: Probability[]]
  ) {
    const valFn = operationFunctions[op];
    if (items.length < 2) {
      throw new Error("Expect at least 2 values for operation");
    }
    // reduce uses all items starting at index 1
    const finalEntries = items.slice(1).reduce((entries, item) => {
      const output: Array<VariableEntry> = [];
      entries.forEach(([val, count]) => {
        item.data.forEach(([nextVal, nextCount]) => {
          output.push([valFn(val, nextVal), count * nextCount]);
        });
      });
      // simplify the entries each time to keep the counts low.
      return Probability.simplifyEntries(output);
    }, items[0].data);
    return new Probability(finalEntries);
  }
  operation(
    op: OperationTypes,
    ...other: [other: Probability, ...rest: Probability[]]
  ) {
    return Probability.operation(op, this, ...other);
  }
  static isValidFlattenEntries(
    input: unknown
  ): input is Array<EntryType<ProbabilityInputType | Probability>> {
    return (
      Array.isArray(input) &&
      input.every(
        (val) =>
          Array.isArray(val) &&
          val.length === 2 &&
          isVariable(val[1]) &&
          (val[0] instanceof Probability || Probability.isValidInput(val[0]))
      )
    );
  }
  // fn outputs will often result in an array of entries with the left side being a probability or similar
  static flattenOutputToEntries(
    values: Array<EntryType<ProbabilityInputType | Probability>>
  ): VariableEntryArray {
    const entries: VariableEntryArray = [];
    let multiplier = 1;
    values.forEach(([val, count]) => {
      if (count < 1) {
        throw new Error("Invalid count in values");
      }
      const innerEntries =
        val instanceof Probability
          ? val.entries
          : Probability.parseInputToEntries(val);
      const innerCount = Probability.entriesCount(innerEntries);
      if (innerCount < 1) {
        throw new Error("Expected the inner count to be >= 1");
      }
      const currentMultiplier = multiplier;
      multiplier = multiplier * innerCount;
      if (innerCount > 1) {
        entries.forEach((entry) => {
          entry[1] = entry[1] * innerCount;
        });
      }
      innerEntries.forEach((entry) => {
        entries.push([entry[0], entry[1] * count * currentMultiplier]);
      });
    });
    // constructor will handle simplifying the data
    return entries;
  }
  static flattenOutputs(
    values: Array<EntryType<ProbabilityInputType | Probability>>
  ): Probability {
    return new Probability(Probability.flattenOutputToEntries(values));
  }

  static isValidInput(input: unknown): input is ProbabilityInputType {
    return (
      isVariableInput(input) ||
      (typeof input === "string" && /^d\d+$/.test(input)) ||
      (!!input &&
        typeof input === "object" &&
        "max" in input &&
        isVariableInput(input.max) &&
        (!("min" in input) || isVariableInput(input.min))) ||
      (Array.isArray(input) &&
        input.every(
          (val) =>
            isVariableInput(val) ||
            (Array.isArray(val) &&
              val.length === 2 &&
              val.every((subVal) => isVariableInput(subVal)))
        ))
    );
  }

  private static parseInputToEntries(input: ProbabilityInputType) {
    let data: ProbabilityInputType = input;
    if (typeof data === "string") {
      const dMatch = data.match(/^d(\d+)$/);
      if (dMatch !== null) {
        data = { max: dMatch[1] };
      } else {
        data = asVariable(data);
      }
    }
    if (isVariable(data)) {
      data = [data];
    }

    if (data && typeof data === "object" && "max" in data) {
      const { max, min = 1 } = data;
      const maxNumber = asVariable(max);
      const minNumber = asVariable(min);
      const values: number[] = [];
      for (let i = minNumber; i <= maxNumber; i += 1) {
        values.push(i);
      }
      data = values;
    }

    const output = data.map<VariableEntry>((val) => {
      if (Array.isArray(val)) {
        return val.map((subVal) => asVariable(subVal)) as VariableEntry;
      }
      return [asVariable(val), 1];
    });

    if (output.some((ent) => ent[1] < 1)) {
      throw new Error("Expected all entries to have a count >= 1");
    }
    return Probability.simplifyEntries(output);
  }

  private static simplifyEntries(
    input: VariableEntryArray
  ): VariableEntryArray {
    const unique = toUniqueVarEntries(input);
    let alreadyOnes = true;
    let isArray = unique.every((entry, index, arr) => {
      const count = entry[1];
      alreadyOnes = alreadyOnes && count === 1;
      if (index === 0) {
        return true;
      }
      return count === arr[index - 1][1];
    });
    let output: VariableEntryArray;
    if (isArray) {
      output = alreadyOnes ? unique : unique.map((ent) => [ent[0], 1]);
    } else {
      output = minimizeEntryCounts(unique);
    }
    // re-validate just to be safe
    if (output.some((ent) => ent[1] < 1)) {
      throw new Error("expected data entries to have a count >= 1");
    }
    return output;
  }

  constructor(input: ProbabilityInputType) {
    const parsed = Probability.parseInputToEntries(input);
    // after we know the data is assigned correctly. sort the values with largest first
    this.data = parsed.toSorted((a, b) => b[0] - a[0]);
    Object.freeze(this.data);
  }
  // sum of entries
  private static entriesCount(entries: Readonly<VariableEntryArray>): number {
    return entries.reduce((output, ent) => output + ent[1], 0);
  }
  private _getTotalCount = getOnce(() => Probability.entriesCount(this.data));
  // the total number of values in this item.
  get totalCount(): number {
    return this._getTotalCount();
  }
  get isVariable(): boolean {
    return this.totalCount === 1;
  }
  get entries(): ReadonlyArray<VariableEntry> {
    return this.data;
  }
  private _getValues: GetterFn<ReadonlyArray<Variable>> = getOnce(() =>
    this.data.map((part) => part[0])
  );
  // return all values in this item
  get values(): ReadonlyArray<Variable> {
    return this._getValues();
  }
}
