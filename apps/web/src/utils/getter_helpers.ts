import type { GetterFn, MaybeGetter } from "./types";

export function isGetterFn<T>(input: MaybeGetter<T>): input is GetterFn<T> {
  return typeof input === "function";
}

export function asGetterFn<T>(input: MaybeGetter<T>): GetterFn<T> {
  return isGetterFn(input) ? input : () => input;
}

export function getVal<T>(input: MaybeGetter<T>): T {
  return isGetterFn(input) ? input() : input;
}
/**
 * An attempt at doing this logic with a generator function in case it was cleaner, but it doesn't seem like this is a good usecase for generators
 */
// function runOnce<Fn extends FnType>(fn: Fn) {
//     function* getGen() {
//       let result = fn();
//       while (true) {
//         yield result;
//       }
//     }
//     const gen = getGen();
//     return function() {
//       const result = gen.next();
//       console.log(`result: ${result.value} - done? ${result.done}`);
//       return result.value;
//     }
//   }

// wrapping a getter function to only call once.
export function getOnce<T>(fn: GetterFn<T>): GetterFn<T> {
  let results: T;
  let hasRun = false;
  return function () {
    if (!hasRun) {
      results = fn();
    }
    return results;
  };
}

// Wrapping a MaybeGetter with once. Will return input every time if not a type. So ideally slightly more efficient.
export function asOnceGetter<T>(input: MaybeGetter<T>): GetterFn<T> {
  if (isGetterFn(input)) {
    return getOnce(input);
  }
  return () => input;
}
