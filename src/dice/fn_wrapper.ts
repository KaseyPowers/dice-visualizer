import { ArrayItemType, IsSingleTypeArray } from "@/utils/types";
import type {
  AsDataTypeKey,
  FnDataType,
  FnDataTypeKey,
  DataType,
} from "./types";

type MapArray<Inputs extends Array<FnDataTypeKey>> = {
  [K in keyof Inputs]: FnDataType<Inputs[K]>;
};

type InputFn<
  Inputs extends Array<FnDataTypeKey> = Array<FnDataTypeKey>,
  Out extends FnDataTypeKey = FnDataTypeKey
> = (...inputs: MapArray<Inputs>) => FnDataType<Out>;

type AsArray<T> = T extends Array<unknown> ? T : T[];

type OutputType<Key extends FnDataTypeKey = FnDataTypeKey> = DataType<
  AsDataTypeKey<Key>
>;

export function wrapFunction<
  Inputs extends FnDataTypeKey | Array<FnDataTypeKey> =
    | FnDataTypeKey
    | Array<FnDataTypeKey>,
  Out extends FnDataTypeKey = FnDataTypeKey
>(
  inputsKeys: Inputs,
  out: Out,
  fn: InputFn<AsArray<Inputs>, Out>
): OutputType<Out>;
export function wrapFunction(
  inputsKeys: FnDataTypeKey | Array<FnDataTypeKey>,
  out: FnDataTypeKey,
  fn: InputFn
): OutputType {
  return null as any;
}
