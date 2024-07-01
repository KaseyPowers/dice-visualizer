import { useState, useCallback, useMemo, useReducer, useEffect } from "react";
import type { SeriesOptions } from "../use_results";

export default function useItemControls(childCount: number, canAdd: boolean) {
  const canShowChildren = useMemo(() => childCount > 1, [childCount]);
  const [showChildren, setShowChildren] = useState<boolean>(canShowChildren);
  useEffect(() => {
    if (!canShowChildren) {
      setShowChildren(false);
    }
  }, [setShowChildren, canShowChildren]);
  const [updating, setUpdatingState] = useState<null | number>(null);

  const onToggleClick = useMemo(() => {
    if (childCount > 0) {
      // if only one child, this function only ever toggles updating state
      if (childCount === 1) {
        return () => setUpdatingState((current) => (current === 0 ? null : 0));
      }

      return (index?: number) => {
        // if number, toggling an index (updating)
        if (typeof index === "number") {
          setUpdatingState((current) => (current === index ? null : index));
        } else {
          setShowChildren((wasOpen) => {
            // if hiding children, make sure to remove updating value too
            if (wasOpen) {
              setUpdatingState(null);
            }
            return !wasOpen;
          });
        }
      };
    }
  }, [childCount, setUpdatingState, setShowChildren]);

  const [adding, setAddingState] = useState<null | {
    show: boolean;
    value: SeriesOptions;
  }>(null);
  const isAdding = useMemo(() => !!adding?.show, [adding?.show]);
  const addingVal = useMemo(() => adding?.value, [adding?.value]);
  const onAddNew = useMemo(() => {
    if (canAdd) {
      return (value: SeriesOptions = {}) =>
        setAddingState({ show: true, value });
    }
  }, [canAdd, setAddingState]);
  const onAddComplete = useCallback(
    () => setAddingState(null),
    [setAddingState],
  );
  useEffect(() => {
    if (!canAdd) {
      onAddComplete();
    }
  }, [onAddComplete, canAdd]);

  const isOpen = useMemo(
    () => showChildren || isAdding || typeof updating === "number",
    [showChildren, isAdding, updating],
  );
  const canOpen = useMemo(
    () => canShowChildren || canAdd,
    [canShowChildren, canAdd],
  );

  return {
    isOpen,
    canOpen,
    showChildren,
    updating,
    onToggleClick,
    isAdding,
    addingVal,
    onAddNew,
    onAddComplete,
  };
}
