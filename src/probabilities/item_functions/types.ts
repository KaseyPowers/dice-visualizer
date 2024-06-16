import { ArrayItemType, IsSingleTypeArray } from "@/utils/types";
import type {
  DataTagType,
  Collection,
  Dice,
  DataItemType,
  DataItem,
} from "../classes";
import { EntryType, type DataVariableType } from "../types";

// In case of unions (should be avoided, but just in case), will check from largest to smallest, returning first find
type SingleDataItemTypeFromTag<Tag extends DataTagType> =
  "collection" extends Tag
    ? Collection
    : "dice" extends Tag
    ? Dice
    : "var" extends Tag
    ? DataVariableType
    : never;

type DataItemTypeFromTag<Tag extends DataTagType> = Tag extends DataTagType
  ? SingleDataItemTypeFromTag<Tag>
  : never;

type SingleTagFromItemType<Item extends DataItemType> = Collection extends Item
  ? "collection"
  : Dice extends Item
  ? "dice"
  : DataVariableType extends Item
  ? "var"
  : never;

export type TagFromItemType<Item extends DataItemType> =
  Item extends DataItemType ? SingleTagFromItemType<Item> : never;

export type InputParamsToTags<Params extends Array<DataItemType>> = {
  [K in keyof Params]: TagFromItemType<Params[K]>;
};

type _InputTagsToParams<Tags extends Array<DataTagType>> = {
  [K in keyof Tags]: DataItemTypeFromTag<Tags[K]>;
};
type _InputTagsToParamsValid<Value> = Value extends Array<DataItemType>
  ? Value
  : never;
export type InputTagsToParams<Tags extends Array<DataTagType>> =
  _InputTagsToParamsValid<_InputTagsToParams<Tags>>;

export type InputFnDef<
  Params extends Array<DataItemType> = Array<DataItemType>,
  // default any because of too many types possible from InputTagsToParams?
  //   Params extends Array<DataItemType> = any,
  R extends DataItemType = DataItemType
> = (...args: Params) => R;

// export type InputFnDef<
//   Params extends Array<DataItemType>,
//   // default any because of too many types possible from InputTagsToParams?
//   //   Params extends Array<DataItemType> = any,
//   R extends DataItemType
// > = (...args: Params) => R;

// export type InputFnDef = (...args: DataItemType[]) => DataItemType;

// type InputTagsFromFn<Fn> = Fn extends (
//   ...args: infer P extends Array<DataItemType>
// ) => any
//   ? InputParamsToTags<P>
//   : never;
export type InputTagsFromFn<Fn extends InputFnDef> = InputParamsToTags<
  Parameters<Fn>
>;

export type InputTagsTypeFromFn<Fn extends InputFnDef> = DataTagInputType<
  InputParamsToTags<Parameters<Fn>>
>;

// type OutputTagsFromFn<Fn> = Fn extends ((
//   ...args: any[]
// ) => infer R extends DataItemType)
//   ? TagFromItemType<R>
//   : never;
export type OutputTagsFromFn<Fn extends InputFnDef> = TagFromItemType<
  ReturnType<Fn>
>;

export type DataTagInputType<
  Tags extends Array<DataTagType> = Array<DataTagType>
> = IsSingleTypeArray<Tags, ArrayItemType<Tags>, never> | Tags;

export type DataTagInputTypeFromParams<Inputs extends Array<DataItemType>> =
  DataTagInputType<InputParamsToTags<Inputs>>;

// export type InputFnFromTags<
//   Input extends Array<DataTagType>,
//   Out extends DataTagType
// > = InputFnDef<InputTagsToParams<Input>, DataItemTypeFromTag<Out>>;

// Base type definition, if I make the input generic types extend each other, it willc reate a circular reference, so just check after and have type Never if invalid
// export type ItemFunctionInput<
//   InputTags extends Array<DataTagType> = Array<DataTagType>,
//   Out extends DataTagType = DataTagType
// > = {
//   input: DataTagInputType<InputTags>;
//   output: Out;
//   fn: InputFnFromTags<InputTags, Out>;
// };

// export type ItemFunctionInput<Fn extends InputFnDef> = {
//   input: DataTagInputType<InputTagsFromFn<Fn>>;
//   output: OutputTagsFromFn<Fn>;
//   fn: Fn;
// };

// export type ItemFunctionInputFromFn<Fn extends InputFnDef> = ItemFunctionInput<
//   InputTagsFromFn<Fn>,
//   OutputTagsFromFn<Fn>
// > & { fn: Fn };

// export type ItemFunctionInputFromTags<
//   InputTags extends Array<DataTagType>,
//   Out extends DataTagType
// > = ItemFunctionInput<InputTags, Out>;

// We don't care if array is tags or items, we just need to make sure the array has the same length
type ToDataItemParams<Vals extends Array<DataTagType> | Array<DataItemType>> = {
  [K in keyof Vals]: DataItem;
};
export type WrappedFnType<
  Vals extends Array<DataTagType> | Array<DataItemType> = Array<DataItemType>
> = (...items: ToDataItemParams<Vals>) => DataItem;

// These types for defining multiple functions to accomplish this. (I imagine there will be need for different types to handle different sized data sets efficiently?)
// NOTE: lets seee if I can get away with leaving these without generics and mix in nicely
export type OutputType = EntryType<DataItemType>;
export type GetTagFnType = (index: number) => DataTagType;
export type GetOutputsFn = (
  items: Array<DataItem>,
  getTag: GetTagFnType,
  fn: InputFnDef
) => Array<OutputType>;
