export type Comparitor<T> = (a: T, b: T) => number;
// equality I technically just care if it's truthy, so will allow undefined as false for simplicity
export type EqualityFn<T> = (a: T, b: T) => boolean | undefined;

export type EqualityOrComparitor<T> = Comparitor<T> | EqualityFn<T>;

export function checkIsEqual<T>(a: T, b: T, fn?: EqualityOrComparitor<T>) {
  const result = (fn ?? Object.is)(a, b);
  // comparitor returns 0 for equal, so check for that
  if (typeof result === "number") {
    return result === 0;
  }
  return !!result;
}
// check array values are equal and in the same order
export function arraysEqual<T>(
  a: ReadonlyArray<T>,
  b: ReadonlyArray<T>,
  valFn?: EqualityOrComparitor<T>,
): boolean {
  return (
    a.length === b.length &&
    a.every((val, index) => checkIsEqual(val, b[index], valFn))
  );
}
// will return true if the arrays are equal, otherwise sort them and compare again to see if they have the same values inside
export function arrayContentsEqual<T>(
  a: ReadonlyArray<T>,
  b: ReadonlyArray<T>,
  sortCallback: Comparitor<T>,
): boolean {
  return (
    arraysEqual(a, b, sortCallback) ||
    (a.length === b.length &&
      arraysEqual(
        a.toSorted(sortCallback),
        b.toSorted(sortCallback),
        sortCallback,
      ))
  );
}
