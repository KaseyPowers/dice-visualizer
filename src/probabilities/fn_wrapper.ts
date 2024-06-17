import { Probability } from "./prob";
import { ProbabilityArray } from "./prob_arr";
import {
  Variable,
  DataTagType,
  DataTagValue,
  EntryType,
  OutputTagValue,
  ItemType,
} from "./types";
import { isVariable } from "./var";

function tagForItem(item: ItemType): DataTagType {
  if (item instanceof ProbabilityArray) {
    return "array";
  }
  if (item instanceof Probability) {
    return "dice";
  }
  return "var";
}

type TagsToParams<In extends Array<DataTagType>> = {
  [K in keyof In]: DataTagValue<In[K]>;
};
type IfParamsValid<Params> = Params extends Array<ItemType> ? Params : never;

type InputTagType = DataTagType[] | DataTagType;
type AsArray<T extends InputTagType> = T extends Array<DataTagType>
  ? T
  : Array<T>;

type FnDef<
  In extends InputTagType = InputTagType,
  Out extends DataTagType = DataTagType
> = (...args: IfParamsValid<TagsToParams<AsArray<In>>>) => OutputTagValue<Out>;

type _ToItems<T extends Array<unknown>> = {
  [K in keyof T]: ItemType;
};
type ToItems<T extends Array<unknown>> = _ToItems<T> extends Array<unknown>
  ? _ToItems<T>
  : never;

type OutputFn<
  Inputs extends Array<DataTagType> = Array<DataTagType>,
  Out extends DataTagType = DataTagType
> = (
  ...args: ToItems<Inputs>
) =>
  | ("array" extends Out ? ProbabilityArray : never)
  | ("dice" extends Out ? Probability : never)
  | ("var" extends Out ? Probability : never);

export function createProbabilityFn<
  In extends InputTagType = InputTagType,
  Out extends DataTagType = DataTagType,
  Fn extends FnDef<In, Out> = FnDef<In, Out>
>(fn: Fn, inputs: In, out: Out): OutputFn<AsArray<In>, Out>;
export function createProbabilityFn(
  fn: FnDef,
  inputs: InputTagType,
  out: DataTagType
): OutputFn {
  const getTag = Array.isArray(inputs)
    ? (index: number) => inputs[index]
    : () => inputs;

  return function (...items) {
    function buildOutput(
      params: ItemType[],
      count: number
    ): EntryType<OutputTagValue>[] {
      const index = params.length;
      if (index >= items.length) {
        const result = fn(...params);
        return [[result, count]];
      }
      const tag = getTag(index);
      let item = items[index];
      const itemTag = tagForItem(item);
      if (itemTag === tag) {
        return buildOutput([...params, item], count);
      }
      // we know if itemTag is an array, that tag is not, so can step array down to a single item
      if (itemTag === "array") {
        if (!(item instanceof ProbabilityArray)) {
          throw new Error("Expected item to be a ProbabilityArray");
        }
        item = item.toSingleValue();
      }
      if (item instanceof ProbabilityArray) {
        throw new Error("Shouldn't be possible to be an array here");
      }
      if (isVariable(item)) {
        if (tag === "var") {
          return buildOutput([...params, item], count);
        }
        item = new Probability(item);
      }
      if (tag === "dice") {
        return buildOutput([...params, item], count);
      }
      if (tag === "array") {
        item = new ProbabilityArray([item]);
        return buildOutput([...params, item], count);
      }
      return item.entries.reduce((output, entry) => {
        return [
          ...output,
          ...buildOutput([...params, entry[0]], count + entry[1]),
        ];
      }, [] as EntryType<OutputTagValue>[]);
    }

    const outputs = buildOutput([], 1);
    if (out === "array") {
      return ProbabilityArray.flattenOutputs(outputs);
    }
    //if not an array, expect the output type for fn to only have probability input values
    if (!Probability.isValidFlattenEntries(outputs)) {
      throw new Error("Expected outputs to be parsable by Probability");
    }
    return Probability.flattenOutputs(outputs);
  };
}
