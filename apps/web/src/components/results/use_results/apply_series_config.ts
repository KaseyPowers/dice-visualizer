import type {
  DataItem,
  SeriesConfig,
  SeriesData,
  RangeType,
  FullSeriesData,
  SeriesPartConfig,
} from "./types";
import { keepSmallerRange } from "./utils";

function getRange(dataRange: RangeType, options: SeriesConfig) {
  const step = options.step ?? 1;
  const range =
    options.range ? keepSmallerRange(dataRange, options.range) : [...dataRange];
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

export default function applySeriesConfig(
  baseData: SeriesData,
  configs: FullSeriesData["partConfigs"][number],
) {
  const { id, label, values: dataVals } = baseData;
  const options: SeriesPartConfig = {
    ...baseData.defaultConfig,
    ...configs.defaultConfig,
    ...configs.config,
    ...baseData.staticConfig,
  };

  const { range, step } = getRange(baseData.range, options);
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
  // if nextVal didn't reach the end of the range
  if (nextVal <= max && nextVal >= min) {
    const newItem = { value: nextVal, percentage: toAdd };
    // use direciton to determine if we add to start or end of array
    if (direction > 0) {
      values.push(newItem);
    } else {
      values.unshift(newItem);
    }
  }

  return {
    id: id + options.label,
    label: label + options.label,
    values,
    color: options.color!,
  };
}
