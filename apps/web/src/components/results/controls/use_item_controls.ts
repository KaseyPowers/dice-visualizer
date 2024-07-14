import { useState, useCallback, useMemo, useReducer, useEffect } from "react";
import type { SeriesPartConfig } from "../use_results";

export default function useControlState(
  onAdd?: (value: Partial<SeriesPartConfig>) => void,
) {
  const [open, setOpen] = useState<boolean | "add">(false);
  const canAdd = !!onAdd;
  useEffect(() => {
    if (!canAdd) {
      setOpen((val) => {
        if (val === "add") {
          return false;
        }
        return val;
      });
    }
  }, [setOpen, canAdd]);

  const submitAdd = useCallback(
    (value: Partial<SeriesPartConfig> = {}) => {
      if (!onAdd) {
        throw new Error("can't submit without fn");
      }
      onAdd(value);
      setOpen(false);
    },
    [setOpen, onAdd],
  );

  const addClick = useCallback(() => {
    setOpen((val) => {
      if (val === "add") {
        return false;
      }
      return "add";
    });
  }, [setOpen]);

  const toggleClick = useCallback(() => {
    setOpen((val) => {
      // toggle just switches false and default true, so simple logic
      return !val;
    });
  }, [setOpen]);

  return { open, submitAdd, addClick, toggleClick };
}
