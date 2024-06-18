"use client";
import { useCallback, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { DiceResult, parseDiceResults } from "@/dice/results";
import DisplayProbabilityResults, { type InputItemProp } from "./results";
import { Stack } from "@mui/material";

const testStrings = [
  // "d20",
  //  "d20 + 4",
  "d20 + d4",
];
const items = testStrings.map((str) => ({
  label: str,
  ...parseDiceResults(str),
}));

export default function ProcessProbabilities() {
  const [input, setInput] = useState<string>("");
  const [items, setItems] = useState<InputItemProp | null | string>(null);
  const processInput = useCallback(() => {
    let nextItem: InputItemProp | string | null = null;
    const trimmed = input.trim();
    if (trimmed.length > 0) {
      try {
        nextItem = { label: trimmed, ...parseDiceResults(trimmed) };
      } catch (err) {
        nextItem = err instanceof Error ? err.message : "Parsing Failed";
      }
    }
    setItems(nextItem);
  }, [input, setItems]);
  return (
    <div>
      <Stack direction="row">
        <TextField
          label="Input"
          variant="outlined"
          defaultValue={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button onClick={processInput}>Parse</Button>
      </Stack>
      {items === null ? (
        <div>Nothing parsed yet</div>
      ) : typeof items === "string" ? (
        <div>
          Something went wrong! <span>{items}</span>
        </div>
      ) : (
        <DisplayProbabilityResults items={items} />
      )}
    </div>
  );
}
