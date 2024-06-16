import type { GetOutputsFn, OutputType } from "./types";
import type { DataItemType } from "../classes";
import { Dice, assertValueForTag } from "../classes";

const recursiveFn: GetOutputsFn = function (items, getTag, fn) {
  function buildOutput(
    params: Array<DataItemType>,
    count: number
  ): OutputType[] {
    const index = params.length;
    // if ran out of items to add, run function and add output
    if (index >= items.length) {
      const result = fn(...params);
      return [[result, count]];
    }
    const target = getTag(index);
    const data = items[index].getClosestType(target);
    if (target === "var" && data instanceof Dice) {
      return data.entries.reduce((output, entry) => {
        // TODO: Confirm the count math here
        return output.concat(
          buildOutput([...params, entry[0]], count + entry[1])
        );
      }, [] as OutputType[]);
    } else {
      assertValueForTag(target, data);
      return buildOutput([...params, data], count);
    }
  }
  return buildOutput([], 1);
};

export default recursiveFn;
