import type { ChartOptions, SeriesOptions } from "./types";
import { blueberryTwilightPalette } from "@mui/x-charts/colorPalettes";

export const ChartOptionsDefaults: ChartOptions = {
  step: 1,
  colors: blueberryTwilightPalette,
};

export const SeriesOptionsDefaults: SeriesOptions = {
  step: 1,
  mod: "equalUp",
};
