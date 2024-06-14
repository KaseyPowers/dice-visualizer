import { DataVariableType } from "../types";
import { wrapFn } from "../utils";

function addDef(...vals: DataVariableType[]): DataVariableType {
  return vals.reduce((output, val) => output + val, 0);
}

const add = wrapFn(addDef, "var");
