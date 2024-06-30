import { useMemo } from "react";
import type {
  LineSeriesType,
  AxisConfig,
  ResponsiveChartContainerProps,
  ChartsXAxisProps,
  ChartsYAxisProps,
} from "@mui/x-charts";

import type {
  ChartOptions,
  SeriesData,
  CombinedSeriesData,
  CombinedOptionValues,
} from "./types";
import { percentStrings } from "./utils";

import getSeriesData from "./get_series_data";

type PercentAxisType = AxisConfig<"linear", number, ChartsYAxisProps>;
type ValueAxisType = AxisConfig<"linear", number, ChartsXAxisProps>;
const percentAxisBase: PercentAxisType = {
  id: "percentage",
  scaleType: "linear",
  valueFormatter: percentStrings,
};
const valueAxisBase: ValueAxisType = {
  id: "values",
  scaleType: "linear",
};

function getAllSeriesData(
  data: SeriesData[],
  options: Record<string, CombinedOptionValues>,
) {
  const output: CombinedSeriesData[] = [];
  data.forEach((item) => {
    const { currentOptions, defaultOptions } = options[item.id];
    if (currentOptions.length === 1) {
      output.push(
        getSeriesData(item, {
          ...defaultOptions[0],
          ...currentOptions[0],
        }),
      );
    } else {
      for (let i = 0; i < currentOptions.length; i++) {
        const opt = currentOptions[i];
        const def = defaultOptions[i];
        output.push(
          getSeriesData(
            item,
            {
              ...def,
              ...opt,
            },
            i,
          ),
        );
      }
    }
  });
  return output;
}

function getBaseAxisData(data: CombinedSeriesData[]) {
  const percentAxis: PercentAxisType = { ...percentAxisBase };
  const valueAxis: ValueAxisType = { ...valueAxisBase, data: [] };
  const series: LineSeriesType[] = [];
  if (data.length <= 0) {
    percentAxis.min = 0;
    percentAxis.max = 100;
  } else {
    const allValuesSet = new Set<number>();
    data.forEach((d) => d.values.forEach((v) => allValuesSet.add(v.value)));
    // get every value in data for the xAxis data
    const allValues = Array.from(allValuesSet);
    allValues.sort((a, b) => a - b);
    valueAxis.data = allValues;
    debugger;
    data.forEach(({ id, label, values, color }) => {
      const seriesVal: LineSeriesType = {
        id,
        label,
        type: "line",
        color,
        showMark: true,
        curve: "linear",
        connectNulls: true,
        valueFormatter: percentStrings,
      };
      let valIndex = 0;
      seriesVal.data = allValues.map((val) => {
        // if value is greater than last index, move valIndex to find the next match or larger
        while (valIndex < values.length && values[valIndex].value < val) {
          valIndex++;
        }
        // the valIndex is either out of range, or has a value greater than the expected one
        if (valIndex < values.length && values[valIndex].value === val) {
          return values[valIndex].percentage;
        }
        // if not found, use null
        return null;
      });
      series.push(seriesVal);
    });
  }
  return { percentAxis, valueAxis, series };
}

export default function useChartData(
  data: SeriesData[],
  options: Record<string, CombinedOptionValues>,
  chartOptions: ChartOptions,
) {
  const allSeries = useMemo(
    () => getAllSeriesData(data, options),
    [data, options],
  );
  const baseData = useMemo(() => getBaseAxisData(allSeries), [allSeries]);

  return useMemo(() => {
    const { series, percentAxis } = baseData;
    const valueAxis =
      chartOptions.range ?
        {
          ...baseData.valueAxis,
          min: chartOptions.range[0],
          max: chartOptions.range[1],
        }
      : baseData.valueAxis;
    return {
      xAxis: [valueAxis],
      yAxis: [percentAxis],
      series,
    };
  }, [baseData, chartOptions.range]);
}
