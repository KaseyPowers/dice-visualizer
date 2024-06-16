import createItemFunction from "../item_functions";
import { DataVariableType } from "../types";

export function addInner(...vals: DataVariableType[]): DataVariableType {
  return vals.reduce((output, val) => output + val, 0);
}

const add = createItemFunction(addInner, "var", "var");
export default add;
