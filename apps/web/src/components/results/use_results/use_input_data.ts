import { useMemo, useState, useEffect } from "react";
import type { InputSeriesData, RangeType, SeriesData } from "./types";
import { SeriesConfigDefaults } from "./constants";

function processInputData(inputData: InputSeriesData[]) {
  return inputData.map((input) => {
    const values = input.values.toSorted((a, b) => a.value - b.value);
    const max = values.at(-1);
    if (!max) {
      throw new Error("Missing largest?");
    }
    const range: RangeType = [values[0].value, max.value];
    console.log(`input range: ${range}`);
    const output: SeriesData = {
      id: input.id ?? input.label,
      label: input.label,
      values,
      range,
      defaultConfig: {
        ...SeriesConfigDefaults,
        ...input.defaultConfig,
      },
    };

    if (input.config && Object.keys(input.config).length > 0) {
      output.staticConfig = input.config;
    }

    return output;
  });
}

export default function useInputData(inputData: InputSeriesData[]) {
  return useMemo(() => processInputData(inputData), [inputData]);
}
