import { DataItem } from "./data_item2";
// The tuple here is to help condense the collection. ex. 4d4 can be [d4, 4] instead of [d4, d4, d4, d4]
type DataCollectionEntry = [DataItem, number];
class DataCollection {
  value: DataCollectionEntry | Array<DataItem | DataCollectionEntry>;
  // condense this collection down into single item
  toDataItem(): DataItem;
}
