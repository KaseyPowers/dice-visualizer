import {
  isDataTagType,
  type DataItemType,
  type DataItemTypeFromTag,
  type DataTagType,
} from "../classes";
import type {
  DataTagInputType,
  InputFnDef,
  InputTagsFromFn,
  OutputTagsFromFn,
  WrappedFnType,
  InputParamsToTags,
  TagFromItemType,
  DataTagInputTypeFromParams,
  InputTagsToParams,
  InputTagsTypeFromFn,
  // InputFnFromTags,
} from "./types";

import recursiveFn from "./recursive_output";
import buildOutputs from "./outputs_builder";
import getOutputItem from "./parse_output";

const recursive = true;
const outputsFn = recursive ? recursiveFn : buildOutputs;

type GetInputFnDef<
  In extends DataTagType | Array<DataTagType>,
  Out extends DataTagType
> = InputFnDef<
  InputTagsToParams<In extends Array<DataTagType> ? In : In[]>,
  DataItemTypeFromTag<Out>
>;

export function createItemFunction<
  In extends DataTagType | Array<DataTagType> = Array<DataTagType>,
  Out extends DataTagType = DataTagType,
  Fn extends GetInputFnDef<In, Out> = GetInputFnDef<In, Out>
>(
  fn: Fn,
  inputs: In,
  out: Out
): WrappedFnType<In extends Array<DataTagType> ? In : In[]>;
export function createItemFunction(
  fn: InputFnDef,
  inputs: DataTagInputType,
  out: DataTagType
): WrappedFnType {
  const getTag = Array.isArray(inputs)
    ? (index: number) => inputs[index]
    : () => inputs;

  return function (...items) {
    const outputs = outputsFn(items, getTag, fn);
    return getOutputItem(outputs, out);
  };
}
