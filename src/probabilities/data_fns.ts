import { type DataVariable, DataItem, DataCollection } from "./data_item";
import { isDataVariable } from "./utils/type_checks";

export type DataTypeKeys = "collection" | "dice" | "var";

type DataTypeKeysInput = DataTypeKeys | Array<DataTypeKeys>;
type InAsArray<In extends DataTypeKeysInput> = In extends Array<DataTypeKeys>
  ? In
  : Array<In>;

// take the key and return the input type expected in inner function. (for params and output);
export type DataFnDefTypeFromKey<Key extends DataTypeKeys> =
  "collection" extends Key
    ? DataCollection
    : "dice" extends Key
    ? DataItem
    : "var" extends Key
    ? DataVariable
    : never;
// remap an array of keys for params
type DataFnDefParamsMap<Keys extends Array<DataTypeKeys>> = {
  [K in keyof Keys]: DataFnDefTypeFromKey<Keys[K]>;
};
export type DataFnDefParams<Keys extends DataTypeKeysInput> =
  DataFnDefParamsMap<InAsArray<Keys>>;

export type DataFnDef<
  In extends DataTypeKeysInput,
  Out extends DataTypeKeys
> = (...args: DataFnDefParams<In>) => DataFnDefTypeFromKey<Out>;

type UsedDataTypes = DataVariable | DataItem | DataCollection;
// use this mapping just to make sure the param's line up
type WrappedFnParams<Keys extends Array<DataTypeKeys>> = {
  [K in keyof Keys]: UsedDataTypes;
};

type ExactWrappedFnParams<
  In extends Array<DataTypeKeys>,
  Input extends WrappedFnParams<In>
> = WrappedFnParams<In> & {
  [K in keyof Input]: K extends keyof In ? Input[K] : never;
};

// Variable checker, for casting we care about the destinction between yes, no and sometimes
type IsVariable<T, Yes, Sometimes, No> = [T] extends [DataVariable]
  ? Yes
  : DataVariable extends T
  ? Sometimes
  : No;
type CheckInputCastsDice<
  InKeys extends Array<DataTypeKeys>,
  Input extends ExactWrappedFnParams<InKeys, Input>
> = {
  // only datavariable can be cast up
  [K in keyof InKeys]: K extends keyof Input
    ? Input[K] extends UsedDataTypes
      ? // only care if this key expects a data variable
        // IsUpcast<InKeys[K], Input[K], 1, 0>
        // IsVariable<DataFnDefTypeFromKey<InKeys[K]>, 1, 0> & IsVariable<Input[K], 0, 1>
        DataFnDefTypeFromKey<InKeys[K]> extends DataVariable
        ? IsVariable<Input[K], never, 0, 1>
        : never
      : never
    : never;
}[number];
type CheckResults<T, True, False> = 1 extends T
  ? True
  : 0 extends T
  ? True | False
  : False;

type DoesInputCastDice<
  InKeys extends Array<DataTypeKeys>,
  Input extends ExactWrappedFnParams<InKeys, Input>,
  True,
  False
> = CheckResults<CheckInputCastsDice<InKeys, Input>, True, False>;

// Using the fact that DataFnDefTypeFromKey will use the largest type returned, we can just union "dice" if there is a casting up of dice in output, which will leave it unchanged if output already was dice/collection
type WrappedFnOutput<
  InKeys extends DataTypeKeysInput,
  Input extends ExactWrappedFnParams<InAsArray<InKeys>, Input>,
  Out extends DataTypeKeys
> =
  | DataFnDefTypeFromKey<Out>
  | (1 extends DoesInputCastDice<InAsArray<InKeys>, Input, 1, 0>
      ? DataFnDefTypeFromKey<Out | "dice">
      : never);

export function wrapFnLogic<
  In extends DataTypeKeysInput,
  Out extends DataTypeKeys
>(fn: DataFnDef<In, Out>, types: [In, Out]) {
  const [inputTypes] = types;
  const getInputType: (index: number) => DataTypeKeys = Array.isArray(
    inputTypes
  )
    ? (index) => inputTypes[index]!
    : () => inputTypes;

  return function wrapped<
    Input extends ExactWrappedFnParams<InAsArray<In>, Input>
  >(input: Input): WrappedFnOutput<In, Input, Out> {
    /**
     * Paths through this:
     * - actual input = fn input -> fn output
     * - only simple conversions (var -> dice, dice -> collection, collection -> dice) -> fn output unchanged
     * - any step downs (dice -> var) means calling one for each var in dice, -> (fn output -> dice if not already)
     */
    let hasDiceCasting = false;
    // Map through the inputs, up or down-casting them to the closest type we can use
    const closestInput = input.map((inputVal, index) => {
      const inputType = getInputType(index);
      let asDice: DataItem | undefined;
      if (inputVal instanceof DataCollection) {
        // return unchanged collection if they line up
        if (inputType === "collection") {
          return inputVal;
        }
        // otherwise drop to a dice
        asDice = inputVal.toDataItem();
      } else if (inputVal instanceof DataItem) {
        asDice = inputVal;
      } else if (isDataVariable(inputVal)) {
        // return var unchanged if they line up, otherwise cast up to a dataItem
        if (inputType === "var") {
          return inputVal;
        }
        asDice = new DataItem(inputVal);
      }

      // at this point, collection and vars will have returned a matching input, otherwise we have a dice value to work with
      if (typeof asDice === "undefined") {
        throw new Error(
          "missed something, asDice should be defined at this point"
        );
      }
      // simple convert to collection
      if (inputType === "collection") {
        return new DataCollection([asDice]);
      }
      // if the dataItem can be a variable, convert it to a variable
      if (inputType === "var" && asDice.canBeVariable()) {
        return asDice.toDataVariable();
      }
      // up to this point, any returned value is the expected input type, so if the inputType is not dice, than it must be a dice casting to a var.
      hasDiceCasting = hasDiceCasting || inputType !== "dice";
      return asDice;
    });

    if (!hasDiceCasting) {
      return fn(...(closestInput as DataFnDefParams<In>));
    }
    const outputCounts: Array<[DataFnDefTypeFromKey<Out>, number]> = [];
    function buildOutput(
      remainingInputs: UsedDataTypes[],
      currentInputs: UsedDataTypes[],
      count: number
    ) {
      const nextInput = remainingInputs.shift();
      if (typeof nextInput === "undefined") {
        return outputCounts.push([
          fn(...(currentInputs as DataFnDefParams<In>)),
          count,
        ]);
      }
      // the index of nextInput should be equal to currentInputs.length
      const compareType = getInputType(currentInputs.length);
      // if the type isn't a dice, or the compareType is expecting a dice, we are good to continue
      if (!(nextInput instanceof DataItem) || compareType === "dice") {
        return buildOutput(
          [...remainingInputs],
          [...currentInputs, nextInput],
          count
        );
      }
      // now iterate through entries, multiplying the count to get the final outputs
      nextInput.entries.forEach(([entryVal, entryCount]) => {
        buildOutput(
          [...remainingInputs],
          [...currentInputs, entryVal],
          count * entryCount
        );
      });
    }
    // now build out the outputs;
    buildOutput(closestInput, [], 1);
    // TODO: recombine the output counts. Slightly more complex than current parse-able entries
  };
}
