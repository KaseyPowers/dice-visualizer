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

type DataTypeForKey<K extends FnDataTypeKey> = "array" extends K
  ? DiceArrayType
  : "dice" extends K
  ? DiceType
  : "var" extends K
  ? VarType
  : never;

type _DataKeyForType<
  Type extends FnDataType,
  Key extends FnDataTypeKey = FnDataTypeKey
> = Key extends FnDataTypeKey
  ? FnDataType<Key> extends Type
    ? Key
    : never
  : never;

export type DataKeyForType<Type extends FnDataType = FnDataType> =
  _DataKeyForType<Type>;

type DataTypeMap = {
  [K in FnDataTypeKey]: DataTypeForKey<K>;
};

export type DataType<K extends DataTypeKey = DataTypeKey> = DataTypeMap[K];
export type FnDataType<K extends FnDataTypeKey = FnDataTypeKey> =
  DataTypeMap[K];

export type RangeInput = {
  min?: VarType;
  max: VarType;
};
export type DiceInputTypes = VarType | RangeInput | Array<VarType> | DiceType;

export type InnerDiceArrayInput = DiceInputTypes | DiceArrayType;
export type ArrayInputType = InnerDiceArrayInput | Array<InnerDiceArrayInput>;

export type InputTypeForKey<Key extends FnDataTypeKey> = "array" extends Key
  ? ArrayInputType
  : "dice" extends Key
  ? DiceInputTypes
  : "var" extends Key
  ? VarType
  : never;

type InputTypeMap = {
  [K in FnDataTypeKey]: InputTypeForKey<K>;
};
export type DataTypeInput<K extends FnDataTypeKey = FnDataTypeKey> =
  InputTypeMap[K];
