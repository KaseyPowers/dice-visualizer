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

import { FullSeriesData, SeriesData, SeriesConfig } from "../use_results";
import SeriesItemTitle, { SeriesItemTitleProps } from "./series_item_title";
import {
  OptionItemControls,
  NewOptionControls,
} from "./single_option_controls";
import { useCallback, useMemo, useState } from "react";

import useItemControls from "./use_item_controls";
import { defaultConfig } from "next/dist/server/config-shared";

const leftIndent = 28;

export default function DataItemControls({ item }: { item: FullSeriesData }) {
  const {
    id,
    label,
    addConfig,
    removeConfig,
    update,
    partConfigs,
    staticConfig,
    defaultConfig,
  } = item;

  const childCount = partConfigs.length;
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
  } = useItemControls(childCount, !!addConfig);

  const addSubmit = useCallback(
    (value: SeriesConfig) => {
      addConfig!(value);
      onAddComplete();
    },
    [addConfig, onAddComplete],
  );

  return (
    <Paper component="li">
      <SeriesItemTitle
        label={label}
        iconWidth={leftIndent}
        color={
          childCount > 0 ?
            partConfigs.map(
              (part) => part.config.color ?? part.defaultConfig.color!,
            )
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
                partConfigs.map((part, i) => {
                  const partLabel =
                    part.config.label ?? part.defaultConfig.label!;
                  const thisId = `${id}_${partLabel}`;

                  return (
                    <div key={thisId}>
                      {childCount > 1 && (
                        <SeriesItemTitle
                          color={part.config.color ?? part.defaultConfig.color!}
                          onClick={() => onToggleClick!(i)}
                          onAdd={onAddNew && (() => onAddNew(part.config))}
                          onRemove={removeConfig && (() => removeConfig(i))}
                        />
                      )}
                      <Collapse
                        in={updating === i}
                        timeout="auto"
                        unmountOnExit
                      >
                        <OptionItemControls
                          staticValues={staticConfig}
                          defaultValues={part.defaultConfig}
                          value={part.config}
                          onChange={(key, value) => update!(i, key, value)}
                        />
                      </Collapse>
                      <Divider />
                    </div>
                  );
                })}
              {addConfig && (
                <>
                  <Collapse in={isAdding} timeout="auto" unmountOnExit>
                    <NewOptionControls
                      value={addingVal!}
                      defaultValues={defaultConfig}
                      staticValues={staticConfig}
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
