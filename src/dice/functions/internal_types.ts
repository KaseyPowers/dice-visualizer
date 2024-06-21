import { ArrayItemType, IsSingleTypeArray } from "@/utils/types";
import type {
  AsDataTypeKey,
  FnDataType,
  FnDataTypeKey,
  DataType,
  DiceFnResult,
  DiceArrayFnResult,
  Entry,
  DataTypeInput,
  DataKeyForType,
  DiceArrayType,
  VarType,
  DataTypeKey,
} from "../types";

/** Input related types */
export type InputFnDef<Inputs extends FnDataType[] = FnDataType[]> = (
  ...inputs: Inputs
) => DataTypeInput;

export type InputKeyTypeForKeys<Keys extends FnDataTypeKey[]> =
  | Keys
  | IsSingleTypeArray<Keys, ArrayItemType<Keys>>;

type MapParamsToKeys<Types extends Array<FnDataType>> = {
  [P in keyof Types]: DataKeyForType<Types[P]>;
};

export type InputKeyTypeForParams<Params extends FnDataType[]> =
  InputKeyTypeForKeys<MapParamsToKeys<Params>>;

type MapKeysToType<Keys extends Array<FnDataTypeKey>> = {
  [K in keyof Keys]: FnDataType<Keys[K]>;
};
export type InputFnDefFromKeys<Keys extends Array<FnDataTypeKey>> = InputFnDef<
  MapKeysToType<Keys>
>;

/** Output related types */
type MapToAnyFnDataType<Input extends unknown[] = unknown[]> = {
  [K in keyof Input]: FnDataType;
};

export type OutputFunctionReturns<Out extends FnDataTypeKey = FnDataTypeKey> =
  | DataType<AsDataTypeKey<Out>>
  | FnDataType<Out>;

export type OutputFunctionType<
  Inputs extends unknown[] = unknown[],
  Out extends FnDataTypeKey = FnDataTypeKey
> = (...items: MapToAnyFnDataType<Inputs>) => OutputFunctionReturns<Out>;

export type BuildOutputsFn = (
  items: FnDataType[],
  getKey: (index: number) => FnDataTypeKey,
  fn: InputFnDef,
  outputKey: DataTypeKey
) => Entry<OutputFunctionReturns>[];
