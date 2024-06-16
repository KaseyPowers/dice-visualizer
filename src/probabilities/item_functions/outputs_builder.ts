import type { GetOutputsFn, OutputType } from "./types";
import type { DataItemType } from "../classes";
import { Dice, assertValueForTag } from "../classes";
import type { EntryType } from "../types";

type InputEntry = EntryType<DataItemType[]>;
type Inputs = Array<InputEntry>;
const buildOutputs: GetOutputsFn = function (items, getTag, fn) {
  // needs a starting value to work with
  let inputs: Inputs = [[[], 1]];

  items.forEach((item, index) => {
    const tag = getTag(index);
    const data = item.getClosestType(tag);
    // if returned a dice for a var, spread it
    if (tag === "var" && data instanceof Dice) {
      inputs = data.entries.reduce((output, entry) => {
        return output.concat(
          inputs.map((input) => [[...input[0], entry[0]], input[1] + entry[1]])
        );
      }, [] as Inputs);
    } else {
      assertValueForTag(tag, data);
      inputs.forEach((input) => {
        input[0].push(data);
      });
    }
  });

  return inputs.map(([params, count]) => {
    return [fn(...params), count];
  });
};

export default buildOutputs;
