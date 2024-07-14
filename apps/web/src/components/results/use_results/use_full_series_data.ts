import { useEffect, useMemo, useCallback, useState } from "react";
import { useTheme } from "@mui/material/styles";
import type {
  SeriesConfig,
  SeriesPartConfig,
  ChartConfig,
  SeriesData,
  FullSeriesData,
} from "./types";
import { SeriesConfigDefaults, SeriesPartConfigKeys } from "./constants";

function useColors(chartConfig: ChartConfig) {
  const colors = chartConfig.colors!;
  const theme = useTheme();
  return useMemo(
    () => (typeof colors === "function" ? colors(theme.palette.mode) : colors),
    [colors, theme.palette.mode],
  );
}

type AllSeriesConfig = Partial<
  Record<string, Array<Partial<SeriesPartConfig>>>
>;

function useAllSeriesConfigState(data: SeriesData[]) {
  const [allConfig, setAllConfigState] = useState<AllSeriesConfig>(() =>
    data.reduce<AllSeriesConfig>((output, { id }) => {
      output[id] = [{}];
      return output;
    }, {}),
  );

  useEffect(() => {
    setAllConfigState((current) => {
      let madeChange = false;
      const currentKeys = Object.keys(current);

      const next = data.reduce<AllSeriesConfig>(
        (output, { id, staticConfig, defaultConfig }) => {
          let currentConfigs = current[id];
          let idChanged = typeof currentConfigs === "undefined";
          let nextConfigs = [...(currentConfigs ?? [])];
          if (nextConfigs.length <= 0) {
            nextConfigs.push({});
            idChanged = true;
          }
          const staticKeys = Object.keys(staticConfig ?? {}) as Array<
            keyof SeriesConfig
          >;
          const defaultKeys = Object.keys(defaultConfig) as Array<
            keyof SeriesConfig
          >;

          if (staticKeys.length > 0 || defaultKeys.length > 0) {
            for (let i = 0; i < nextConfigs.length; i++) {
              let thisChange = false;
              let nextVal = { ...nextConfigs[i] };
              staticKeys.forEach((key) => {
                if (key in nextVal) {
                  delete nextVal[key];
                  thisChange = true;
                }
              });
              defaultKeys.forEach((key) => {
                if (nextVal[key] === defaultConfig[key]) {
                  delete nextVal[key];
                  thisChange = true;
                }
              });
              if (thisChange) {
                nextConfigs[i] = nextVal;
                idChanged = true;
              }
            }
          }
          if (idChanged) {
            output[id] = nextConfigs;
            madeChange = true;
          } else {
            output[id] = currentConfigs;
          }

          return output;
        },
        {},
      );

      if (!madeChange) {
        madeChange = currentKeys.some((key) => !(key in next));
      }
      return madeChange ? next : current;
    });
  }, [setAllConfigState, data]);

  const updateConfig = useCallback(
    <Key extends keyof SeriesPartConfig>(
      id: string,
      index: number,
      key: Key,
      value?: SeriesPartConfig[Key],
    ) => {
      setAllConfigState((current) => {
        const currentConfig = current[id];
        if (!currentConfig) {
          throw new Error("missing Config");
        }
        const config = currentConfig.at(index);
        if (!config) {
          throw new Error("missing index");
        }
        const nextConfig = { ...config };
        if (typeof value === "undefined") {
          if (key in nextConfig) {
            delete nextConfig[key];
          } else {
            return current;
          }
        } else if (nextConfig[key] === value) {
          return current;
        } else {
          nextConfig[key] = value;
        }
        const nextConfigs = [...currentConfig];
        nextConfigs[index] = nextConfig;
        return {
          ...current,
          [id]: nextConfigs,
        };
      });
    },
    [setAllConfigState],
  );

  const addConfig = useCallback(
    (id: string, value?: Partial<SeriesPartConfig>, addAt?: number) => {
      setAllConfigState((state) => {
        const current = state[id];
        if (!current) {
          throw new Error("missing id");
        }
        let addIndex = addAt ?? -1;
        // since we are inserting at addIndex+1, it won't work with negative indexes
        if (addIndex < 0) {
          addIndex += current.length;
        }
        const next = current.toSpliced(addIndex + 1, 0, { ...value });
        return {
          ...state,
          [id]: next,
        };
      });
    },
    [setAllConfigState],
  );

  const removeConfig = useCallback(
    (id: string, index: number) => {
      setAllConfigState((state) => {
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
    [setAllConfigState],
  );

  return { allConfig, updateConfig, addConfig, removeConfig };
}

export default function useFullSeriesData(
  data: SeriesData[],
  chartConfig: ChartConfig,
) {
  const allSeriesConfig = useAllSeriesConfigState(data);

  const colorArr = useColors(chartConfig);

  const chartStep = useMemo(() => chartConfig.step, [chartConfig.step]);

  return useMemo(() => {
    const { allConfig, addConfig, removeConfig, updateConfig } =
      allSeriesConfig;
    let count = 0;
    return data.map<FullSeriesData>((item) => {
      const { id, range, defaultConfig: itemDefaultConfig, ...rest } = item;

      const defaultConfig = {
        step: chartStep,
        ...itemDefaultConfig,
      };
      // first render of a new item will always be empty
      const stateConfigs = allConfig[item.id] ?? [];

      const partConfigs: FullSeriesData["partConfigs"] = stateConfigs.map(
        (config, i) => {
          const color = colorArr[count % colorArr.length];
          count++;
          return {
            config,
            defaultConfig: {
              ...defaultConfig,
              label: stateConfigs.length > 1 ? `(${i})` : "",
              color,
            },
          };
        },
      );
      const staticKeys =
        item.staticConfig ?
          (Object.keys(item.staticConfig) as Array<keyof SeriesConfig>)
        : [];

      let assignableKeys = [...SeriesPartConfigKeys];
      if (staticKeys.length > 0) {
        assignableKeys = assignableKeys.filter(
          (k) => !staticKeys.includes(k as keyof SeriesConfig),
        );
      }

      const output: FullSeriesData = {
        id,
        range,
        ...rest,
        defaultConfig,
        partConfigs,
      };

      if (assignableKeys.length > 0) {
        output.addConfig = (value, addAt) => addConfig(id, value, addAt);
        output.removeConfig = (index) => removeConfig(id, index);
        output.update = (index, key, value) => {
          if (!assignableKeys.includes(key)) {
            throw new Error("Tried updating static key");
          }
          let val = value;
          const thisDefault = partConfigs[index].defaultConfig;
          if (typeof val !== "undefined" && val === thisDefault[key]) {
            val = undefined;
          }

          return updateConfig(id, index, key, val);
        };
      }

      return output;
    });
  }, [data, chartStep, allSeriesConfig]);
}
