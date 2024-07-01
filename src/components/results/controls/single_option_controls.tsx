import { useState, useMemo, useCallback } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import Collapse from "@mui/material/Collapse";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import AddIcon from "@mui/icons-material/Add";

import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import {
  CombinedOptionValues,
  SeriesData,
  SeriesOptions,
  SeriesOptionsKeys,
  allMods,
} from "../use_results";
import { Button } from "@mui/material";

interface OptionItemControlProps {
  staticValues?: SeriesOptions | undefined;
  defaultValues: SeriesOptions;
  value: SeriesOptions;
  onChange: <Key extends keyof SeriesOptions>(
    key: Key,
    value: SeriesOptions[Key],
  ) => void;
}

function OptionItemControlFields({
  staticValues,
  defaultValues,
  value,
  onChange,
}: OptionItemControlProps) {
  const stepValue: number = useMemo(
    () => staticValues?.step ?? value.step ?? defaultValues.step ?? 1,
    [staticValues?.step, defaultValues?.step, value.step],
  );

  const { modOptions, modValue } = useMemo(() => {
    if (staticValues?.mod) {
      return { modValue: staticValues.mod, modOptions: [staticValues.mod] };
    }

    let modValue = value.mod ?? defaultValues.mod ?? "";
    let modOptions =
      stepValue !== 1 ? allMods : (
        allMods.filter(
          (val) => val && (val === modValue || !val.startsWith("equal")),
        )
      );
    return {
      modValue,
      modOptions,
    };
  }, [stepValue, staticValues?.mod, value.mod, defaultValues.mod]);

  return (
    <>
      <TextField
        size="small"
        fullWidth
        select
        label="Mod Type"
        disabled={!!staticValues?.mod}
        value={modValue}
        onChange={(e) =>
          onChange("mod", e.target.value as SeriesOptions["mod"])
        }
      >
        {modOptions.map((mod) => (
          <MenuItem key={mod} value={mod}>
            {mod}
          </MenuItem>
        ))}
      </TextField>
      {/* {!(staticOptions && "step" in staticOptions) && <div>TODO: Step</div>}
      {!(staticOptions && "range" in staticOptions) && <div>TODO: Range</div>} */}
    </>
  );
}

export function OptionItemControls(props: OptionItemControlProps) {
  return (
    <Box component="div" paddingY={1}>
      <OptionItemControlFields {...props} />
    </Box>
  );
}

export function NewOptionControls({
  value: initValues,
  onSubmit,
  ...rest
}: Omit<OptionItemControlProps, "onChange"> & {
  onSubmit: (values: SeriesOptions) => void;
}) {
  const [value, setValueState] = useState<SeriesOptions>(initValues);

  const onChange = useCallback<OptionItemControlProps["onChange"]>(
    (key, value) => {
      setValueState((current) =>
        current[key] === value ? current : { ...current, [key]: value },
      );
    },
    [setValueState],
  );

  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      action={() => onSubmit(value)}
      paddingY={1}
    >
      <OptionItemControlFields {...rest} value={value} onChange={onChange} />
      <Button variant="contained" color="primary" type="submit">
        Add
      </Button>
    </Box>
  );
}
