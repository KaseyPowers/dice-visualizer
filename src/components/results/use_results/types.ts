import { type ChartsColorPalette } from "@mui/x-charts/colorPalettes";
import type { PartPartial } from "@/utils/types";

export type RangeType = [min: number, max: number];
/** Options */
interface ScaleConfig {
  step?: number | undefined;
  range?: RangeType;
}

export interface ChartConfig extends ScaleConfig {
  // if true, swap the x-y axis logic to have percentages on X-axis
  //   swapAxis?: boolean;
  colors?: ChartsColorPalette;
}

export type ModType = "atLeast" | "atMost" | "equalUp" | "equalDown";

// Standard options for a series as a whole
export interface SeriesConfig extends ScaleConfig {
  mod: ModType;
}

export interface SeriesPartConfig extends SeriesConfig {
  label: string;
  color?: string;
}
/** Data */
// single value in array
export interface DataItem {
  value: number;
  percentage: number;
}

interface BaseSeriesData {
  id: string;
  label: string;
  values: Array<DataItem>;
  range: RangeType;
}

export type InputSeriesData = (Omit<BaseSeriesData, "id" | "range"> &
  Partial<Pick<BaseSeriesData, "id">>) & {
  config?: Partial<SeriesConfig>;
  defaultConfig?: Partial<SeriesConfig>;
};

export interface UseDataInputs extends ChartConfig {
  // TODO: Input configs for those controls
  data: InputSeriesData[];
}

export interface SeriesData extends BaseSeriesData {
  staticConfig?: Partial<SeriesConfig>;
  defaultConfig: SeriesConfig;
}

export interface FullSeriesDataPart {
  config: Partial<SeriesPartConfig>;
  defaultConfig: SeriesPartConfig;
}
export interface FullSeriesData extends SeriesData {
  partConfigs: Array<FullSeriesDataPart>;
  update?: <Key extends keyof SeriesPartConfig>(
    index: number,
    key: Key,
    value?: SeriesPartConfig[Key],
  ) => void;
  addConfig?: (value: Partial<SeriesPartConfig>, addAt?: number) => void;
  removeConfig?: (index: number) => void;
}
