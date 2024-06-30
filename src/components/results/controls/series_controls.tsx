import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import AddIcon from "@mui/icons-material/Add";
import {
  CombinedOptionValues,
  SeriesData,
  SeriesOptions,
} from "../use_results";

import DataItemControls from "./data_item_controls";

export default function SeriesControls({
  data,
  options,
}: {
  data: SeriesData[];
  options: Record<string, CombinedOptionValues>;
}) {
  return (
    <List>
      {data.map((item) => (
        <DataItemControls key={item.id} item={item} option={options[item.id]} />
      ))}
    </List>
  );
}
