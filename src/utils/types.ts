export type AnyFunction = (...args: any[]) => any;
// Fn with no args that returns T;
export type GetterFn<T> = () => T;

export type MaybeGetter<T> = T | GetterFn<T>;

export type SetThis<Fn extends AnyFunction, This> = Fn extends (
  ...args: infer Args
) => infer R
  ? (this: This, ...args: Args) => R
  : never;
