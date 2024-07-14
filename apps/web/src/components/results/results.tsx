"use client";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { LineChart, LineChartProps } from "@mui/x-charts/LineChart";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import useResults, { type UseDataInputs } from "./use_results";
import SeriesControls from "./controls/full_data_controls";

export type InputItemProps = UseDataInputs;

const marginSmall = 25;
const otherProps = {
  margin: {
    top: marginSmall,
    right: marginSmall,
  },
  slotProps: {
    legend: {
      hidden: true,
    },
  },
  grid: { vertical: true, horizontal: true },
} satisfies Omit<
  LineChartProps,
  keyof ReturnType<typeof useResults>["chartData"]
>;

export default function DisplayProbabilityResults(props: InputItemProps) {
  const { chartData, fullData } = useResults(props);
  // const isVertical = true;
  const theme = useTheme();
  const isVertical = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Paper sx={{ height: "100%", width: "100%" }}>
      <Stack
        height="100%"
        width="100%"
        direction={isVertical ? "column" : "row"}
        spacing={2}
        alignItems="stretch"
        divider={
          <Divider
            orientation={isVertical ? "horizontal" : "vertical"}
            flexItem
          />
        }
      >
        <Box flex="3 1 0%" minWidth={0} minHeight={0} maxHeight="75vw">
          <LineChart {...otherProps} {...chartData} />
        </Box>
        <Box flex="1 1 0%" minWidth={0} padding={2}>
          <SeriesControls data={fullData} />
        </Box>
      </Stack>
    </Paper>
  );
}
