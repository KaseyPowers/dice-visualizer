import { useState, useMemo, useCallback, useId } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Slider, { type SliderProps } from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";

import {
  ModType,
  RangeType,
  SeriesConfig,
  SeriesPartConfig,
  allMods,
} from "../use_results";

export interface OptionItemControlProps {
  onlyItem?: boolean;
  staticValues?: Partial<SeriesConfig> | undefined;
  defaultValues: SeriesPartConfig;
  value: Partial<SeriesPartConfig>;
  onChange: <Key extends keyof SeriesPartConfig>(
    key: Key,
    value: SeriesPartConfig[Key],
  ) => void;
  range: RangeType;
}

function ModSelect({
  stepValue,
  value: currentValue,
  staticValue,
  defaultValue,
  onChange,
}: {
  stepValue: number;
  value?: ModType | undefined;
  staticValue?: ModType | undefined;
  defaultValue: ModType;
  onChange: OptionItemControlProps["onChange"];
}) {
  let options = allMods;

  const hasStatic = typeof staticValue !== "undefined";
  const value = staticValue ?? currentValue ?? defaultValue;
  if (hasStatic) {
    options = [staticValue];
  }
  // if step is 1, we will simplify the two equal types into one. so first filter out both equals, keeping current if it has equal to not force a change.
  if (stepValue === 1) {
    options = allMods.filter(
      (val) => val && (val === value || !val.startsWith("equal")),
    );
    // if current value wasn't an equal, add back the default equalUp to use for "equal" in dropdown
    if (!value.startsWith("equal")) {
      options.push("equalUp");
    }
  }

  return (
    <TextField
      size="small"
      fullWidth
      select
      label="Mod Type"
      disabled={hasStatic}
      value={value}
      onChange={(e) => onChange("mod", e.target.value as SeriesConfig["mod"])}
    >
      {options.map((mod) => (
        <MenuItem key={mod} value={mod}>
          {stepValue === 1 && mod.startsWith("equal") ? "equal" : mod}
        </MenuItem>
      ))}
    </TextField>
  );
}

function OptionItemControlFields({
  onlyItem,
  staticValues,
  defaultValues,
  value,
  onChange,
  range,
}: OptionItemControlProps) {
  const stepId = useId();

  const stepData = useMemo<{ value: number; disabled?: boolean }>(() => {
    if (typeof staticValues?.step !== "undefined") {
      return { disabled: true, value: staticValues.step };
    }
    return { value: value.step ?? defaultValues.step ?? 1 };
  }, [staticValues?.step, defaultValues?.step, value.step]);

  const stepRangeProps = useMemo(() => {
    const val = stepData.value;
    let valFound = false;
    const marks: Array<{ value: number; label?: React.ReactNode }> = [];
    const rangeSize = range[1] - range[0];
    let markStep = Math.floor(rangeSize / 10);
    for (let i = 1; i <= rangeSize; i += markStep) {
      if (!valFound && i >= val) {
        marks.push({ value: i, label: i });
        valFound = true;
      } else {
        marks.push({ value: i });
      }
    }
    marks[0].label = marks[0].value;
    marks[marks.length - 1].label = marks[marks.length - 1].value;

    return {
      marks,
      min: 1,
      max: rangeSize,
    };
  }, [range, stepData.value]);

  return (
    <>
      {!onlyItem && (
        <TextField
          size="small"
          fullWidth
          label="label"
          value={value.label ?? defaultValues.label}
          onChange={(e) => onChange("label", e.target.value)}
        />
      )}
      <ModSelect
        stepValue={stepData.value}
        value={value.mod}
        staticValue={staticValues?.mod}
        defaultValue={defaultValues.mod}
        onChange={onChange}
      />
      <Box px={1}>
        <Typography gutterBottom id={stepId} aria-label="step control">
          Step
        </Typography>
        <Slider
          {...stepData}
          aria-labelledby={stepId}
          size="small"
          {...stepRangeProps}
          step={1}
          shiftStep={5}
          valueLabelDisplay="auto"
          onChange={(_, val) => onChange("step", val as number)}
        />
      </Box>
      {/* {!(staticOptions && "step" in staticOptions) && <div>TODO: Step</div>}
      {!(staticOptions && "range" in staticOptions) && <div>TODO: Range</div>} */}
    </>
  );
}

export function OptionItemControls(props: OptionItemControlProps) {
  return (
    <Stack component="div" paddingY={1} direction="column" spacing={2}>
      <OptionItemControlFields {...props} />
    </Stack>
  );
}

export function NewOptionControls({
  value: initValues,
  onSubmit,
  defaultValues: propDefaults,
  defaultLabel,
  ...rest
}: Omit<OptionItemControlProps, "onChange" | "defaultValues" | "onlyItem"> & {
  defaultValues: SeriesConfig;
  defaultLabel: string;
  onSubmit: (values: Partial<SeriesPartConfig>) => void;
}) {
  const defaultValues: SeriesPartConfig = useMemo(() => {
    return { ...propDefaults, label: defaultLabel };
  }, [propDefaults, defaultLabel]);

  const [value, setValueState] =
    useState<Partial<SeriesPartConfig>>(initValues);

  const onChange = useCallback<OptionItemControlProps["onChange"]>(
    (key, value) => {
      setValueState((current) =>
        current[key] === value ? current : { ...current, [key]: value },
      );
    },
    [setValueState],
  );

  return (
    <Stack
      component="form"
      noValidate
      autoComplete="off"
      action={() => onSubmit(value)}
      paddingY={1}
      direction="column"
      spacing={2}
    >
      <OptionItemControlFields
        {...rest}
        value={value}
        onChange={onChange}
        defaultValues={defaultValues}
      />
      <Button variant="contained" color="primary" type="submit">
        Add
      </Button>
    </Stack>
  );
}
