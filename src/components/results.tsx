"use client";
import { useMemo } from "react";
import { LineChart, LineSeriesType } from "@mui/x-charts";

import type { DiceResult } from "@/dice/results";

export interface InputItemProp extends DiceResult {
  label?: string;
}

export default function DisplayProbabilityResults({
  items,
}: {
  items: InputItemProp | InputItemProp[];
}) {
  const itemArray = useMemo(
    () => (Array.isArray(items) ? items : [items]),
    [items]
  );

  const chartProps = useMemo(() => {
    const dataSetMap = new Map<number, Record<string, number>>();
    const series: LineSeriesType[] = [];
    let minPercentage = 100;
    let maxPercentage = 0;
    itemArray.forEach((result, index) => {
      const { label = index.toString(), values } = result;
      series.push({
        type: "line",
        dataKey: label,
        label: label,
        showMark: true,
        curve: "linear",
      });
      values.forEach((val) => {
        if (val.percentage < minPercentage) {
          minPercentage = val.percentage;
        }
        if (val.percentage > maxPercentage) {
          maxPercentage = val.percentage;
        }
        dataSetMap.set(val.value, {
          ...dataSetMap.get(val.value),
          [label]: val.percentage,
        });
      });
    });
    const dataset = Array.from(dataSetMap).map(([value, obj]) => ({
      value,
      ...obj,
    }));

    const percentageRange = maxPercentage - minPercentage;
    const offset = Math.max(2, Math.ceil(percentageRange / 10));
    let useMax = (1 + Math.floor(maxPercentage / offset)) * offset;
    let useMin = (Math.ceil(minPercentage / offset) - 1) * offset;
    return {
      dataset,
      xAxis: [
        {
          dataKey: "value",
        },
      ],
      series,
      yAxis: [
        {
          valueFormatter: (val: number) => `${val}%`,
          min: useMin,
          max: useMax,
        },
      ],
    };
  }, [itemArray]);

  return (
    <LineChart
      {...chartProps}
      height={300}
      margin={{ left: 50, right: 50, top: 50, bottom: 50 }}
      grid={{ vertical: true, horizontal: true }}
    />
  );
}
