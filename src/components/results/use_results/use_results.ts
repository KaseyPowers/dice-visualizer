import type { UseDataInputs } from "./types";
import useChartData from "./use_chart_data";
import useInputData from "./use_input_data";
import useChartOptions from "./use_chart_options";
import useSeriesOptions from "./use_series_options";

export default function useResults(input: UseDataInputs) {
  const { data, dataIds, options } = useInputData(input.data);

  const { chartOptions } = useChartOptions();
  // setChartOptions

  const seriesOptions = useSeriesOptions(dataIds, options, chartOptions);

  const chartData = useChartData(data, seriesOptions, chartOptions);

  return {
    data,
    dataIds,
    seriesOptions,
    chartData,
  };
}
