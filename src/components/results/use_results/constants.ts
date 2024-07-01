import type { ChartOptions, SeriesOptions } from "./types";
import { blueberryTwilightPalette } from "@mui/x-charts/colorPalettes";

export const SeriesOptionsKeys: Array<keyof SeriesOptions> = [
  "step",
  "range",
  "mod",
  "color",
];
export const allMods: Array<SeriesOptions["mod"]> = [
  "atLeast",
  "atMost",
  "equalDown",
  "equalUp",
];

export const ChartOptionsDefaults: ChartOptions = {
  step: 1,
  colors: blueberryTwilightPalette,
};

export const SeriesOptionsDefaults: SeriesOptions = {
  step: 1,
  mod: "equalUp",
};
