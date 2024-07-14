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
  FullSeriesData,
  SeriesData,
  SeriesConfig,
  FullSeriesDataPart,
  SeriesPartConfig,
} from "../use_results";
import SeriesItemTitle, { SeriesItemTitleProps } from "./series_item_title";
import {
  OptionItemControls,
  NewOptionControls,
  type OptionItemControlProps,
} from "./item_control_form";
import { useCallback, useMemo, useState } from "react";

import useItemControls from "./use_item_controls";
import { defaultConfig } from "next/dist/server/config-shared";

const leftIndent = 28;

type DataItemType =
  | FullSeriesData
  | (Omit<FullSeriesData, "partConfigs"> & {
      part: FullSeriesDataPart;
      index: number;
    });

export default function DataItem({ item }: { item: DataItemType }) {
  const {
    id,
    label,
    addConfig,
    removeConfig,
    update,
    staticConfig,
    defaultConfig,
    range,
  } = item;
  let onAdd: undefined | ((value: Partial<SeriesPartConfig>) => void) =
    addConfig ? (value) => addConfig(value) : undefined;
  let startingValue: OptionItemControlProps["value"] = {};
  let startingIndex: number = 0;
  const hasChildren = "partConfigs" in item;
  const titleProps: SeriesItemTitleProps = {
    label,
    color: "text.disabled",
  };
  let mainContent: React.ReactNode = null;
  if ("partConfigs" in item && item.partConfigs.length > 1) {
    const { partConfigs, ...itemRest } = item;
    titleProps.color = partConfigs.map(
      (part) => part.config.color ?? part.defaultConfig.color!,
    );
    startingIndex = partConfigs.length;

    mainContent = partConfigs.map((part, index) => (
      <DataItem
        key={id + (part.config.label ?? index)}
        item={{
          part,
          index,
          ...itemRest,
        }}
      />
    ));
  } else if ("part" in item || item.partConfigs.length === 1) {
    let index: number;
    let part: FullSeriesDataPart;
    let onlyItem = false;
    if ("part" in item) {
      index = item.index;
      part = item.part;
    } else {
      part = item.partConfigs[0];
      index = 0;
      onlyItem = true;
    }
    // const { index, part } =
    //   "part" in item ? item : { part: item.partConfigs[0], index: 0 };
    if (addConfig) {
      onAdd = (value) => addConfig(value, index);
      startingValue = part.config;
      startingIndex = index + 1;
    }
    if (removeConfig) {
      titleProps.onRemove = () => removeConfig(index);
    }
    titleProps.label += part.config.label ?? part.defaultConfig.label;
    titleProps.color = part.config.color ?? part.defaultConfig.color!;
    mainContent = (
      <OptionItemControls
        onlyItem={onlyItem}
        staticValues={staticConfig}
        defaultValues={part.defaultConfig}
        value={part.config}
        onChange={(key, value) => update!(index, key, value)}
        range={range}
      />
    );
  }
  const { open, submitAdd, addClick, toggleClick } = useItemControls(onAdd);

  if (onAdd) {
    titleProps.onAdd = addClick;
  }
  if (hasChildren) {
    titleProps.iconWidth = leftIndent;
    titleProps.icon = open ? <ExpandLess /> : <ExpandMore />;
  }
  if (mainContent !== null) {
    titleProps.onClick = toggleClick;
  }
  const title = <SeriesItemTitle {...titleProps} />;
  const addContent: React.ReactNode =
    onAdd ?
      <NewOptionControls
        value={startingValue}
        defaultLabel={`(${startingIndex})`}
        defaultValues={defaultConfig}
        staticValues={staticConfig}
        onSubmit={submitAdd}
        range={range}
      />
    : null;

  const content = (
    <>
      {title}
      <Collapse in={!!open} timeout="auto" unmountOnExit>
        {Array.isArray(mainContent) ?
          <>
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
                {mainContent}
              </Box>
            </Box>
            {addContent && (
              <Collapse in={open === "add"} timeout="auto" unmountOnExit>
                {addContent}
              </Collapse>
            )}
          </>
        : addContent && open === "add" ?
          addContent
        : mainContent}
      </Collapse>
    </>
  );

  return hasChildren ? <Paper component="li">{content}</Paper> : content;
}
