import { DataDice, DataType, DataVariable } from "./data_types";

export function asDice(input: DataVariable | Array<DataVariable> | DataDice) {
  const output: DataDice = new Map();
  function addVal(val: DataVariable) {
    output.set(val, (output.get(val) ?? 0) + 1);
  }
}
