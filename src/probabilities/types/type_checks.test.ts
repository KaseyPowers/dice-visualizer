import { isDataEntryType, isDataVariableType } from "./type_checks";

describe("DataVarialbeType", () => {
  describe("isDataVariableType", () => {
    it("should return true for numbers", () => {
      expect(isDataVariableType(5)).toBeTruthy();
      expect(isDataVariableType(-25)).toBeTruthy();
    });
    it("should return false for other types", () => {
      expect(isDataVariableType("string")).toBeFalsy();
      expect(isDataVariableType(true)).toBeFalsy();
    });
  });
});
describe("DataEntryType", () => {
  describe("isDataEntryType", () => {
    it("should return true for a tuple of variable and count", () => {
      expect(isDataEntryType([5, 5])).toBeTruthy();
    });
  });
});
