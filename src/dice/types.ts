export type Entry<T> = [value: T, count: number];

export const DataTypeOptions = ["var", "dice", "array"] as const;
export type FnDataTypeKey = (typeof DataTypeOptions)[number];
export type DataTypeKey = Exclude<FnDataTypeKey, "var">;

export type AsDataTypeKey<K extends FnDataTypeKey> = K extends DataTypeKey
  ? K
  : "dice";

export type VarType = number;
export type VarEntry = Entry<VarType>;
export type DiceType = VarEntry[]; // 2d-array
export type DiceArrayType = DiceType[]; // 3d-array

export type DiceFnResult = Entry<DiceType>;
export type DiceArrayFnResult = Entry<DiceArrayType>;

export type DataTypeForKey<K extends FnDataTypeKey> = "array" extends K
  ? DiceArrayType
  : "dice" extends K
  ? DiceType
  : "var" extends K
  ? VarType
  : never;

export type DataTypeMap = {
  [K in FnDataTypeKey]: DataTypeForKey<K>;
};

export type DataType<K extends DataTypeKey = DataTypeKey> = DataTypeMap[K];
export type FnDataType<K extends FnDataTypeKey = FnDataTypeKey> =
  DataTypeMap[K];

export type RangeInput = {
  min?: VarType;
  max: VarType;
};
