/** starting point as type, could later support strings too */
export type DataVariable = number;
/** A DataMap is is just a collection of variables, order doesn't matter, used for dice and output results */
export type DataDice = Map<DataVariable, number>;
/** Ordered array to store a mixed set of the data types */
export type DataCollection = Array<DataVariable | DataDice>;

export type DataType = DataCollection | DataVariable | DataDice;

export type DataTypeKeys = "variable" | "dice" | "collection";

class DataItem {
  constructor(public value: DataType) {}
}
