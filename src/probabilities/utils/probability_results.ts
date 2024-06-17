import { Probability } from "../prob";
import { ProbabilityArray } from "../prob_arr";
import { ItemType, Variable } from "../types";
import { isVariable } from "../var";

interface ProbabilityValue {
  value: Variable;
  count: number;
  percentage: number;
}

export interface ProbabilityResult {
  values: ProbabilityValue[];
  totalCount: number;
}

export function getProbabilityResults(toDisplay: ItemType) {
  let prob = toDisplay;
  if (prob instanceof ProbabilityArray) {
    prob = prob.toSingleValue();
  }
  if (isVariable(prob)) {
    prob = new Probability(prob);
  }

  const totalCount = prob.totalCount;
  const entries = prob.entries;
  const values = entries.map(([value, count]) => ({
    value,
    count,
    percentage: (100 * count) / totalCount,
  }));
  // for results we want to return smallest to largest
  values.sort((a, b) => a.value - b.value);

  return {
    totalCount,
    values,
  };
}
