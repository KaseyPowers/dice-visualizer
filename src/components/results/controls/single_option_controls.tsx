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

export default function OptionItemControls({
  label,
  defaultOptions,
}: {
  label: string;
  staticOptions?: undefined | SeriesOptions;
  defaultOptions: SeriesOptions;
  optionValues: SeriesOptions;
}) {
  return (
    <ListItem>
      <ListItemAvatar>
        <Box
          display="span"
          width={24}
          height={24}
          bgcolor={defaultOptions.color!}
          borderRadius="50%"
        />
      </ListItemAvatar>
      <ListItemText primary={label} />
    </ListItem>
  );
}
