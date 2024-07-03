import { useState, useMemo, useCallback } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import { SeriesConfig, SeriesPartConfig, allMods } from "../use_results";
import { Button } from "@mui/material";

interface OptionItemControlProps {
  staticValues?: Partial<SeriesConfig> | undefined;
  defaultValues: SeriesPartConfig | SeriesConfig;
  value: Partial<SeriesPartConfig>;
  onChange: <Key extends keyof SeriesPartConfig>(
    key: Key,
    value: SeriesPartConfig[Key],
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

  const { modOptions, modValue, modDisabled } = useMemo(() => {
    if (staticValues?.mod) {
      return {
        modValue: staticValues.mod,
        modOptions: [staticValues.mod],
        modDisabled: true,
      };
    }

    const modValue = value.mod ?? defaultValues.mod ?? "";
    let modOptions = allMods;
    if (stepValue === 1) {
      modOptions = allMods.filter(
        (val) => val && (val === modValue || !val.startsWith("equal")),
      );
      if (!modValue.startsWith("equal")) {
        modOptions.push("equalUp");
      }
    }
    return {
      modValue,
      modOptions,
      modDisabled: false,
    };
  }, [stepValue, staticValues?.mod, value.mod, defaultValues.mod]);

  return (
    <>
      <TextField
        size="small"
        fullWidth
        select
        label="Mod Type"
        disabled={modDisabled}
        value={modValue}
        onChange={(e) => onChange("mod", e.target.value as SeriesConfig["mod"])}
      >
        {modOptions.map((mod) => (
          <MenuItem key={mod} value={mod}>
            {stepValue === 1 && mod.startsWith("equal") ? "equal" : mod}
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
  onSubmit: (values: SeriesConfig) => void;
}) {
  const [value, setValueState] = useState<SeriesConfig>(initValues);

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
