import { useEffect, useMemo, useCallback, useState } from "react";
import { useTheme } from "@mui/material/styles";
import type {
  SeriesOptions,
  ChartOptions,
  SeriesOptionsValuesObject,
  CombinedOptionValues,
  AddNewOptionFn,
} from "./types";
import { SeriesOptionsDefaults, SeriesOptionsKeys } from "./constants";

type AllSeriesOptions = Partial<Record<string, SeriesOptions[]>>;

function useColors(chartOptions: ChartOptions) {
  const colors = chartOptions.colors!;
  const theme = useTheme();
  return useMemo(
    () => (typeof colors === "function" ? colors(theme.palette.mode) : colors),
    [colors, theme.palette.mode],
  );
}

function useAllSeriesOptionsState(
  ids: string[],
  options: SeriesOptionsValuesObject,
) {
  const [allOptions, setAllOptionsState] = useState<AllSeriesOptions>(() =>
    ids.reduce<AllSeriesOptions>((output, id) => {
      output[id] = [{}];
      return output;
    }, {}),
  );

  useEffect(() => {
    setAllOptionsState((current) => {
      let madeChange = false;
      let next = { ...current };
      // first checking the ids are in sync
      Object.keys(current).forEach((id) => {
        if (!ids.includes(id)) {
          delete next[id];
          madeChange = true;
        }
      });
      // now checking if id has options and if options are valid
      ids.forEach((id) => {
        const currentValues = next[id] ?? [];
        let idChange = false;
        let nextValues = [...currentValues];
        if (nextValues.length <= 0) {
          nextValues.push({});
          idChange = true;
        }
        const thisOptions = options[id];
        const staticKeys =
          thisOptions?.static ?
            (Object.keys(thisOptions.static) as Array<keyof SeriesOptions>)
          : [];
        const defaultKeys =
          thisOptions?.default ?
            (Object.keys(thisOptions.default) as Array<keyof SeriesOptions>)
          : [];
        if (staticKeys.length > 0 || defaultKeys.length > 0) {
          for (let i = 0; i < nextValues.length; i++) {
            let thisChange = false;
            let nextVal = { ...nextValues[i] };
            staticKeys.forEach((key) => {
              if (key in nextVal) {
                delete nextVal[key];
                thisChange = true;
              }
            });
            defaultKeys.forEach((key) => {
              if (nextVal[key] === thisOptions?.default?.[key]) {
                delete nextVal[key];
                thisChange = true;
              }
            });
            if (thisChange) {
              nextValues[i] = nextVal;
              idChange = true;
            }
          }
        }

        if (idChange) {
          next[id] = nextValues;
          madeChange = true;
        }
      });
      return madeChange ? next : current;
    });
  }, [setAllOptionsState, ids, options]);

  const setSeriesOption = useCallback(
    <Key extends keyof SeriesOptions>(
      id: string,
      index: number,
      key: Key,
      value?: SeriesOptions[Key],
    ) => {
      setAllOptionsState((current) => {
        const currentOptions = current[id];
        if (!currentOptions) {
          throw new Error("missing options");
        }
        const opt = currentOptions.at(index);
        if (!index) {
          throw new Error("missing index");
        }
        const nextOpt = { ...opt };
        if (typeof value === "undefined") {
          delete nextOpt[key];
        } else {
          nextOpt[key] = value;
        }
        const nextOptions = [...currentOptions];
        nextOptions[index] = nextOpt;
        return {
          ...current,
          [id]: nextOptions,
        };
      });
    },
    [setAllOptionsState],
  );

  const addNewOption = useCallback(
    (
      id: string,
      indexOrValue?: number | SeriesOptions,
      value?: SeriesOptions,
    ) => {
      setAllOptionsState((state) => {
        const current = state[id];
        if (!current) {
          throw new Error("missing id");
        }
        let newValue: SeriesOptions = {};
        let addIndex = -1;
        if (typeof indexOrValue === "number") {
          addIndex = indexOrValue;
          const copy = current.at(addIndex);
          if (!copy) {
            throw new Error("Expected index to point to existing option");
          }
          newValue = { ...newValue, ...copy };
        } else if (indexOrValue) {
          newValue = { ...newValue, ...indexOrValue };
          if (value) {
            throw new Error(
              "expected 3rd argument to only be used when second argument is an index",
            );
          }
        }
        if (value) {
          newValue = { ...newValue, ...value };
        }
        const next = [...current];
        // since we are inserting at addIndex+1, it won't work with negative indexes
        if (addIndex < 0) {
          addIndex += next.length;
        }
        next.splice(addIndex + 1, 0, newValue);
        return {
          ...state,
          [id]: next,
        };
      });
    },
    [setAllOptionsState],
  );

  const removeOption = useCallback(
    (id: string, index: number) => {
      setAllOptionsState((state) => {
        const current = state[id];
        if (!current) {
          throw new Error("Missing id");
        }
        const next = current.toSpliced(index, 1);
        if (next.length === current.length) {
          throw new Error("Failed to remove option for index " + index);
        }
        return {
          ...state,
          [id]: next,
        };
      });
    },
    [setAllOptionsState],
  );

  return { allOptions, setSeriesOption, addNewOption, removeOption };
}

export default function useSeriesOptions(
  ids: string[],
  options: SeriesOptionsValuesObject,
  chartOptions: ChartOptions,
) {
  const { allOptions, setSeriesOption, addNewOption, removeOption } =
    useAllSeriesOptionsState(ids, options);

  const colorArr = useColors(chartOptions);

  const defaultSeriesOptions = useMemo(() => {
    const chartStep = chartOptions.step;
    const output = { ...SeriesOptionsDefaults };
    if (chartStep) {
      output.step = chartStep;
    }
    return output;
  }, [chartOptions.step]);

  const combinedOptions = useMemo(() => {
    let count = 0;
    return ids.reduce<Record<string, CombinedOptionValues>>((output, id) => {
      const currentOptions = allOptions[id] ?? [];

      const seriesStatic = options[id]?.static;
      const seriesDefault = options[id]?.default;
      const commonDefault = {
        ...defaultSeriesOptions,
        ...seriesDefault,
      };

      const next: CombinedOptionValues = {
        static: seriesStatic ?? {},
        default: commonDefault,
        currentOptions,
        // colors are the only default that changes
        defaultOptions: [],
      };

      for (let i = 0; i < currentOptions.length; i++) {
        let color: string;
        if ("color" in commonDefault) {
          color = commonDefault.color;
          delete commonDefault.color;
        } else {
          color = colorArr[count % colorArr.length];
          count++;
        }
        next.defaultOptions.push({
          ...commonDefault,
          color,
        });
      }

      let assignableKeys = SeriesOptionsKeys;
      if (seriesStatic) {
        next.static = seriesStatic;
        const staticKeys = Object.keys(next.static);
        assignableKeys = SeriesOptionsKeys.filter(
          (key) => !staticKeys.includes(key),
        );
      }
      if (assignableKeys.length > 0) {
        next.addNewOption = (
          indexOrValue?: number | SeriesOptions,
          value?: SeriesOptions,
        ) => {
          if (
            typeof indexOrValue === "number" &&
            (indexOrValue < 0 || indexOrValue >= currentOptions.length)
          ) {
            throw new Error("Invalid index");
          }
          addNewOption(id, indexOrValue, value);
        };
      }
      if (currentOptions.length > 0) {
        next.removeOption = (index: number) => {
          if (index < 0 || index >= currentOptions.length) {
            throw new Error("Invalid index");
          }
          removeOption(id, index);
        };

        next.updateOption = <Key extends keyof SeriesOptions>(
          index: number,
          key: Key,
          value?: SeriesOptions[Key],
        ) => {
          if (index < 0 || index >= currentOptions.length) {
            throw new Error("Invalid index");
          }
          if (assignableKeys.includes(key)) {
            throw new Error("Can't modify static keys");
          }
          const thisDefault = next.defaultOptions[index];
          let val = value;
          if (typeof val !== "undefined" && thisDefault[key] === value) {
            val = undefined;
          }
          setSeriesOption(id, index, key, value);
        };
      }

      output[id] = next;
      return output;
    }, {});
  }, [
    ids,
    defaultSeriesOptions,
    colorArr,
    options,
    allOptions,
    setSeriesOption,
    addNewOption,
    removeOption,
  ]);

  return combinedOptions;
}
