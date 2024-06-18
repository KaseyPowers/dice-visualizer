import parseString from "./parse";
import { asDice } from "./type_convert";
import { FnDataType, VarType } from "./types";
import { diceTotalCount } from "./utils/utils";

interface DiceResultValue {
  value: VarType;
  count: number;
  percentage: number;
}
export interface DiceResult {
  values: Array<DiceResultValue>;
  totalCount: number;
}

export function getDiceResults(input: FnDataType): DiceResult {
  const diceValue = asDice(input);
  const totalCount = diceTotalCount(diceValue);
  const values = diceValue.map<DiceResultValue>(([value, count]) => ({
    value,
    count,
    percentage: (100 * count) / totalCount,
  }));
  values.sort((a, b) => a.value - b.value);
  return {
    totalCount,
    values,
  };
}
export function parseDiceResults(input: string): DiceResult {
  return getDiceResults(parseString(input));
}
