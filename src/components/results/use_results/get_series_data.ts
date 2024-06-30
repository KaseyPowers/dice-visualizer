import type {
  DataItem,
  SeriesOptions,
  SeriesData,
  RangeType,
  CombinedSeriesData,
} from "./types";
import { keepSmallerRange } from "./utils";

function getRange(datasRange: RangeType, options: SeriesOptions) {
  const step = options.step ?? 1;
  const range =
    options.range ? keepSmallerRange(datasRange, options.range) : datasRange;
  // shift min-max to closest step
  if (step !== 1) {
    // let msg = `shifting range for step(${step}): before - ${range.toString()}`;
    // remove remainder of divide
    range[0] -= range[0] % step;
    // remove remainder but add step to round up
    const remainder = range[1] % step;
    if (remainder !== 0) {
      range[1] += step - remainder;
    }
    // console.log(msg + " after - ", range);
  }

  return { range, step };
}

export default function getSeriesData(
  data: SeriesData,
  options: SeriesOptions,
  index?: number,
): CombinedSeriesData {
  const dataVals = data.values;
  const { range, step } = getRange(data.range, options);
  const [min, max] = range;

  const values: DataItem[] = [];
  const isEqual =
    options.mod === "equalDown" ||
    options.mod === "equalUp" ||
    typeof options.mod === "undefined";
  const direction =
    options.mod === "atLeast" || options.mod === "equalDown" ? -1 : 1;

  let toAdd = 0;
  let dataI = 0;
  let nextVal = min;
  if (direction < 0) {
    dataI = dataVals.length - 1;
    nextVal = max;
  }
  while (dataI >= 0 && dataI < dataVals.length) {
    const { value, percentage } = dataVals[dataI];
    toAdd += percentage;
    // When moving left to right/largest to smallest, we check value <= nextVal OR 0 <= nextVal - val
    // when moving right to left/smallest to largest, we check value >= nextVal OR 0 >= nextVal - val
    // So, using direction being +-1, (direciton * (val - nextVal)) >= 0 when value is on the correct side of nextValue
    if ((value - nextVal) * direction >= 0) {
      const newItem = { value: nextVal, percentage: toAdd };
      // use direciton to determine if we add to start or end of array
      if (direction > 0) {
        values.push(newItem);
      } else {
        values.unshift(newItem);
      }
      // increment the nextVal
      nextVal += direction * step;
      // if equal types, reset toAdd between steps
      if (isEqual) {
        toAdd = 0;
      }
    }
    dataI += direction;
  }
  let { id, label } = data;
  if (typeof index !== "undefined") {
    id += "_" + index;
    label += "_" + index;
  }
  const color = options.color!;
  return {
    id,
    label,
    values,
    color,
  };
}
