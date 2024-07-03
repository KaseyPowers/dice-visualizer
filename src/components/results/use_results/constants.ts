import type {
  ChartConfig,
  ModType,
  SeriesConfig,
  SeriesPartConfig,
} from "./types";
import { blueberryTwilightPalette } from "@mui/x-charts/colorPalettes";

export const SeriesPartConfigKeys: Array<keyof SeriesPartConfig> = [
  "step",
  "range",
  "mod",
  "label",
  "color",
] as const;

export const allMods: Array<ModType> = [
  "atLeast",
  "atMost",
  "equalDown",
  "equalUp",
];

export const ChartConfigDefaults: ChartConfig = {
  colors: blueberryTwilightPalette,
};

export const SeriesConfigDefaults: SeriesConfig = {
  mod: "equalUp",
};
