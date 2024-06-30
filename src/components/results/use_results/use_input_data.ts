import { useMemo, useState, useEffect } from "react";
import type {
  InputSeriesData,
  RangeType,
  SeriesData,
  SeriesOptionValues,
  SeriesOptionsValuesObject,
} from "./types";

function processInputData(inputData: InputSeriesData[]) {
  const data: SeriesData[] = [];
  const options: SeriesOptionsValuesObject = {};

  inputData.forEach((input) => {
    const values = input.values.toSorted((a, b) => a.value - b.value);
    const range: RangeType = [values[0].value, values.at(-1)?.value!];
    const next: SeriesData = {
      id: input.id ?? input.label,
      label: input.label,
      values,
      range,
    };
    data.push(next);

    const optionsValues: SeriesOptionValues = {};
    if (
      "options" in input &&
      typeof input.options !== "undefined" &&
      Object.keys(input.options).length > 0
    ) {
      optionsValues.static = input.options;
    }
    if ("defaultOptions" in input) {
      optionsValues.default = input.defaultOptions;
    }
    options[next.id] = optionsValues;
  });
  return {
    data,
    dataIds: data.map((d) => d.id),
    options,
  };
}

export default function useInputData(inputData: InputSeriesData[]) {
  return useMemo(() => processInputData(inputData), [inputData]);
}
