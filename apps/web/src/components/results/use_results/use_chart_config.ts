import { useMemo, useState, useCallback } from "react";
import type { ChartConfig } from "./types";
import { isValidRangeType } from "./utils";
import { ChartConfigDefaults } from "./constants";

export default function useChartConfig(inputConfig?: ChartConfig) {
  const defaultConfig = useMemo(
    () => ({
      ...ChartConfigDefaults,
      ...inputConfig,
    }),
    [inputConfig],
  );
  const [chartConfig, setChartConfigState] =
    useState<ChartConfig>(defaultConfig);

  const setChartConfig = useCallback(
    <Key extends keyof ChartConfig>(key: Key, value?: ChartConfig[Key]) => {
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
      if (typeof val !== "undefined" && val === defaultConfig[key]) {
        val = undefined;
      }
      setChartConfigState((current) => {
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
    [defaultConfig, setChartConfigState],
  );

  return {
    chartConfig,
    setChartConfig,
  };
}
