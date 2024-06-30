import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemButton from "@mui/material/ListItemButton";

import Collapse from "@mui/material/Collapse";

import Typography from "@mui/material/Typography";

import AddIcon from "@mui/icons-material/Add";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import {
  CombinedOptionValues,
  SeriesData,
  SeriesOptions,
} from "../use_results";

import SingleOptionControls from "./single_option_controls";
import { useState } from "react";

export default function DataItemControls({
  item,
  option,
}: {
  item: SeriesData;
  option: CombinedOptionValues;
}) {
  const [open, setOpen] = useState(true);
  const { label, id } = item;
  const { addNewOption, currentOptions, defaultOptions } = option;
  const childCount = currentOptions.length;

  return (
    <>
      <ListItem
        secondaryAction={
          <IconButton
            edge="end"
            aria-label="add option"
            onClick={() => addNewOption && addNewOption()}
            disabled={!addNewOption}
          >
            <AddIcon />
          </IconButton>
        }
      >
        <ListItemButton disabled={childCount <= 0}>
          <ListItemIcon>
            {open ?
              <ExpandLess />
            : <ExpandMore />}
          </ListItemIcon>
          <ListItemText primary={label} />
        </ListItemButton>
      </ListItem>
      {childCount > 0 && (
        <ListItem>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List sx={{ paddingLeft: 2 }}>
              {childCount === 1 ?
                <SingleOptionControls
                  label={label}
                  staticOptions={option.static}
                  defaultOptions={defaultOptions[0]}
                  optionValues={currentOptions[0]}
                />
              : currentOptions.map((current, i) => (
                  <SingleOptionControls
                    key={`${id}_${i}`}
                    label={`${label}(${i})`}
                    staticOptions={option.static}
                    defaultOptions={defaultOptions[i]}
                    optionValues={currentOptions[i]}
                  />
                ))
              }
            </List>
          </Collapse>
        </ListItem>
      )}
    </>
  );
}
