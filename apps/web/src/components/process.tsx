"use client";
import { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { parseDiceResults } from "@/dice/results";
import DisplayProbabilityResults, { type InputSeriesData } from "./results";

export default function ProcessProbabilities() {
  const [input, setInput] = useState<string>("");
  const [items, setItems] = useState<InputSeriesData | null | string>(null);
  const processInput = useCallback(() => {
    let nextItem: InputSeriesData | string | null = null;
    const trimmed = input.trim();
    if (trimmed.length > 0) {
      try {
        const results = parseDiceResults(trimmed);
        nextItem = {
          label: trimmed,
          values: results.values,
        };
      } catch (err) {
        nextItem = err instanceof Error ? err.message : "Parsing Failed";
      }
    }
    setItems(nextItem);
  }, [input, setItems]);
  return (
    <Stack
      direction="column"
      alignItems="stretch"
      spacing={2}
      useFlexGap
      height="100%"
      maxHeight="100%"
    >
      <Stack direction="row" justifyContent="center">
        <TextField
          label="Input"
          variant="outlined"
          defaultValue={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button onClick={processInput}>Parse</Button>
      </Stack>
      <Box flex="1 1 0%" padding={2} minWidth={0} minHeight={0}>
        {typeof items === "string" ?
          <div>
            Something went wrong! <span>{items}</span>
          </div>
        : <DisplayProbabilityResults data={items ? [items] : []} />}
      </Box>
    </Stack>
  );
}
