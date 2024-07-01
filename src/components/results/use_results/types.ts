import { type ChartsColorPalette } from "@mui/x-charts/colorPalettes";
import type { PartPartial } from "@/utils/types";
// single value in array
export interface DataItem {
  value: number;
  percentage: number;
}

export type RangeType = [min: number, max: number];
interface BaseSeriesData {
  id: string;
  label: string;
  values: Array<DataItem>;
}

export interface CombinedSeriesData extends BaseSeriesData {
  color: string;
}

export interface SeriesData extends BaseSeriesData {
  range: RangeType;
}

export interface InputSeriesData extends PartPartial<BaseSeriesData, "id"> {
  // allow hard coded options, won't be modifiable
  options?: SeriesOptions;
  // allow default options to be defined
  defaultOptions?: SeriesOptions;
}

export interface SeriesOptionValues {
  static?: SeriesOptions;
  default?: SeriesOptions;
}
export type SeriesOptionsValuesObject = Partial<
  Record<string, SeriesOptionValues>
>;

export interface AddNewOptionFn {
  (index: number, value?: SeriesOptions): void;
  (value?: SeriesOptions): void;
  (): void;
}

export interface CombinedOptionValues extends Required<SeriesOptionValues> {
  updateOption?: <Key extends keyof SeriesOptions>(
    index: number,
    key: Key,
    value?: SeriesOptions[Key],
  ) => void;
  addNewOption?: AddNewOptionFn;
  removeOption?: (index: number) => void;
  currentOptions: Array<SeriesOptions>;
  defaultOptions: Array<SeriesOptions>;
}

export interface CommonOptions {
  step?: number;
  range?: RangeType;
}
export interface SeriesOptions extends CommonOptions {
  mod?: "atLeast" | "atMost" | "equalUp" | "equalDown";
  color?: string;
}

export interface ChartOptions extends CommonOptions {
  // if true, swap the x-y axis logic to have percentages on X-axis
  //   swapAxis?: boolean;
  colors?: ChartsColorPalette;
}

export interface UseDataInputs extends ChartOptions {
  // TODO: Input configs for those controls
  data: InputSeriesData[];
}
