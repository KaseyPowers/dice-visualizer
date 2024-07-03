import type { UseDataInputs } from "./types";
import useInputData from "./use_input_data";
import useChartConfig from "./use_chart_config";

import useFullSeriesData from "./use_full_series_data";
import useChartData from "./use_chart_data";

export default function useResults(input: UseDataInputs) {
  const data = useInputData(input.data);

  const { chartConfig, setChartConfig } = useChartConfig();
  // setChartOptions

  const fullData = useFullSeriesData(data, chartConfig);

  const chartData = useChartData(fullData, chartConfig);

  return {
    fullData,
    chartData,
    chartConfig,
    setChartConfig,
  };
}
