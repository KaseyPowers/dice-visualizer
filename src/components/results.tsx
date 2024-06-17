"use client";
import {
  getProbabilityResults,
  ItemType,
  ProbabilityResult,
} from "@/probabilities";
import { useMemo } from "react";
import { LineChart, LineSeriesType } from "@mui/x-charts";

interface InputItemProp {
  label?: string;
  item: ItemType;
}

export default function DisplayProbabilityResults({
  items,
}: {
  items: InputItemProp | InputItemProp[];
}) {
  const itemResults = useMemo(() => {
    return (Array.isArray(items) ? items : [items]).map((itemProp, index) => {
      if (itemProp.label === "value") {
        throw new Error("'value' is a reserved key");
      }
      return {
        label: itemProp.label ?? index.toString(),
        ...getProbabilityResults(itemProp.item),
      };
    });
  }, [items]);

  const chartProps = useMemo(() => {
    const dataSetMap = new Map<number, Record<string, number>>();
    const series: LineSeriesType[] = [];
    let maxPercentage = 0;
    itemResults.forEach((result) => {
      const { label, values } = result;
      series.push({
        type: "line",
        dataKey: label,
        label: label,
        showMark: true,
        curve: "linear",
      });
      values.forEach((val) => {
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

    let useMax: number;
    // smaller step up on smaller numbers
    if (maxPercentage < 20) {
      // useMax = Math.ceil(maxPercentage) + 2;
      useMax = (1 + Math.floor(maxPercentage / 2)) * 2;
    } else {
      // rounding up to closest factor of 5 (by rounding down + 1, will make sure that on 5 it still increases by 5)
      useMax = (1 + Math.floor(maxPercentage / 5)) * 5;
    }
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
          max: useMax,
        },
      ],
    };
  }, [itemResults]);

  return (
    <LineChart
      {...chartProps}
      height={300}
      margin={{ left: 50, right: 50, top: 50, bottom: 50 }}
      grid={{ vertical: true, horizontal: true }}
    />
  );
}
