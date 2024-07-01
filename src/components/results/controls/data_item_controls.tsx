import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemButton from "@mui/material/ListItemButton";

import Collapse from "@mui/material/Collapse";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import AddIcon from "@mui/icons-material/Add";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import {
  CombinedOptionValues,
  SeriesData,
  SeriesOptions,
} from "../use_results";
import SeriesItemTitle, { SeriesItemTitleProps } from "./series_item_title";
import {
  OptionItemControls,
  NewOptionControls,
} from "./single_option_controls";
import { useCallback, useMemo, useState } from "react";

import useItemControls from "./use_item_controls";

const leftIndent = 28;

export default function DataItemControls({
  item,
  option,
}: {
  item: SeriesData;
  option: CombinedOptionValues;
}) {
  const { label, id } = item;
  const {
    addNewOption,
    removeOption,
    updateOption,
    currentOptions,
    defaultOptions,
    static: staticOptions,
    default: baseDefault,
  } = option;

  const childCount = currentOptions.length;
  const canShowChildren = childCount > 1;

  const {
    isOpen,
    canOpen,
    updating,
    onToggleClick,
    isAdding,
    addingVal,
    onAddNew,
    onAddComplete,
  } = useItemControls(childCount, !!addNewOption);

  const addSubmit = useCallback(
    (value: SeriesOptions) => {
      addNewOption!(value);
      onAddComplete();
    },
    [addNewOption, onAddComplete],
  );

  return (
    <Paper component="li">
      <SeriesItemTitle
        label={label}
        iconWidth={leftIndent}
        color={
          childCount > 0 ?
            defaultOptions.map((opt) => opt.color!)
          : "text.disabled"
        }
        icon={
          canShowChildren ?
            isOpen ?
              <ExpandLess />
            : <ExpandMore />
          : undefined
        }
        onClick={onToggleClick && (() => onToggleClick())}
        onAdd={onAddNew && (() => onAddNew())}
      />
      {canOpen && (
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <Box
            marginLeft={`${leftIndent}px`}
            marginBottom={1}
            display="flex"
            flexDirection="row"
          >
            <Divider orientation="vertical" variant="middle" flexItem />
            <Box
              paddingX={1}
              width="100%"
              height="100%"
              display="flex"
              flexDirection="column"
              alignItems="stretch"
            >
              {childCount > 0 &&
                Array.from({ length: childCount }, (_, i) => i).map((i) => {
                  const thisId = `${id}_${i}`;
                  const thisDefault = defaultOptions[i];
                  const thisOption = currentOptions[i];

                  return (
                    <div key={thisId}>
                      {childCount > 1 && (
                        <SeriesItemTitle
                          color={thisDefault.color!}
                          onClick={() => onToggleClick!(i)}
                          onAdd={
                            onAddNew && (() => onAddNew({ ...thisOption }))
                          }
                          onRemove={removeOption && (() => removeOption(i))}
                        />
                      )}
                      <Collapse
                        in={updating === i}
                        timeout="auto"
                        unmountOnExit
                      >
                        <OptionItemControls
                          staticValues={staticOptions}
                          defaultValues={thisDefault}
                          value={thisOption}
                          onChange={(key, value) =>
                            updateOption!(i, key, value)
                          }
                        />
                      </Collapse>
                      <Divider />
                    </div>
                  );
                })}
              {addNewOption && (
                <>
                  <Collapse in={isAdding} timeout="auto" unmountOnExit>
                    <NewOptionControls
                      value={addingVal!}
                      defaultValues={baseDefault}
                      staticValues={staticOptions}
                      onSubmit={(value) => addSubmit(value)}
                    />
                    <Divider />
                  </Collapse>
                </>
              )}
            </Box>
          </Box>
        </Collapse>
      )}
    </Paper>
  );
}
