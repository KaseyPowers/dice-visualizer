import { useMemo, useState, useCallback } from "react";
import type { ChartOptions } from "./types";
import { isValidRangeType } from "./utils";
import { ChartOptionsDefaults } from "./constants";

type ChartOptionsFn = <Key extends keyof ChartOptions>(
  key: Key,
  value?: ChartOptions[Key],
) => void;

export default function useChartOptions(inputDefaults?: ChartOptions) {
  const defaultOptions = useMemo(
    () => ({
      ...ChartOptionsDefaults,
      ...inputDefaults,
    }),
    [inputDefaults],
  );
  const [chartOptions, setChartOptionsState] =
    useState<ChartOptions>(defaultOptions);

  //   <Key extends keyof ChartOptions>(
  //     key: Key,
  //     value?: ChartOptions[Key] | undefined,
  //   ): void;
  const setChartOptions = useCallback<ChartOptionsFn>(
    (key: keyof ChartOptions, value?: ChartOptions[keyof ChartOptions]) => {
      let val = value;
      if (typeof value !== "undefined") {
        if (key === "step" && (typeof value !== "number" || value <= 0)) {
          throw new Error("Invalid step value");
        } else if (key === "range" && !isValidRangeType(value)) {
          throw new Error("Invalid range value");
        }
        // all that's left is key === "colors" which I'll just leave for material to validate
      }
      // if val is same as defaultOption, treat it as resetting to undefined
      if (typeof val !== "undefined" && val === defaultOptions[key]) {
        val = undefined;
      }
      setChartOptionsState((current) => {
        // if no changes to make, return current;
        if (
          key in current ? current[key] === val : typeof val === "undefined"
        ) {
          return current;
        }
        if (typeof val === "undefined") {
          const next = { ...current };
          delete next[key];
          return next;
        }
        return {
          ...current,
          [key]: val,
        };
      });
    },
    [defaultOptions, setChartOptionsState],
  );

  return {
    chartOptions,
    setChartOptions,
  };
}
