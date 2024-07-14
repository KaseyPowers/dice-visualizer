import type { DataItem, SeriesData, SeriesPartConfig } from "./types";
import applySeriesConfig from "./apply_series_config";

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
      defaultConfig: { mod: "equalUp" },
    };
    const testColor = "color";
    const response = applySeriesConfig(
      {
        ...testBase,
        range: [testValues[0].value, testValues.at(-1)?.value!],
      },
      {
        defaultConfig: { label: "", mod: "equalUp", color: testColor },
        config: {},
      },
    );
    expect(response).toEqual({
      ...testBase,
      color: testColor,
    });
  });
});
