import type { FnDataTypeKey, DiceArrayType } from "../types";
import { InputFnDefFromKeys } from "./internal_types";
import { wrapFunction } from "./fn_wrapper";

export function wrapArraySpreadFn<
  SpreadType extends Exclude<FnDataTypeKey, "array">,
  Out extends FnDataTypeKey,
>(spreadInput: SpreadType, out: Out, fn: InputFnDefFromKeys<SpreadType[]>) {
  const innerFn = wrapFunction(fn, spreadInput, out);
  return wrapFunction(
    (array: DiceArrayType) => innerFn(...array),
    "array",
    out,
  );
}
