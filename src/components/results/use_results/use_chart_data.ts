import { useMemo } from "react";
import type {
  LineSeriesType,
  AxisConfig,
  ChartsXAxisProps,
  ChartsYAxisProps,
} from "@mui/x-charts";

import type { ChartConfig, SeriesData, FullSeriesData } from "./types";
import { percentStrings } from "./utils";

import applySeriesConfig from "./apply_series_config";

type AppliedSeriesData = ReturnType<typeof applySeriesConfig>;

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

function getBaseAxisData(data: AppliedSeriesData[]) {
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
  data: FullSeriesData[],
  chartOptions: ChartConfig,
) {
  const allSeries = useMemo(
    () =>
      data.reduce<Array<AppliedSeriesData>>((output, item) => {
        const { partConfigs, ...rest } = item;
        return output.concat(
          partConfigs.map((part) => applySeriesConfig(rest, part)),
        );
      }, []),
    [data],
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
