import type { DataItem, SeriesData } from "./types";
import getSeriesData from "./get_series_data";

describe("getSeriesData", () => {
  it("Will return same values without step/range options", () => {
    const testValues: DataItem[] = Array.from({ length: 20 }, (_, i) => ({
      value: i,
      percentage: i,
    }));
    const testBase: Omit<SeriesData, "range"> = {
      id: "test_id",
      label: "test_label",
      values: testValues,
    };
    const testColor = "color";
    const response = getSeriesData(
      {
        ...testBase,
        range: [testValues[0].value, testValues.at(-1)?.value!],
      },
      { color: testColor },
    );
    expect(response).toEqual({
      ...testBase,
      color: testColor,
    });
  });
});
