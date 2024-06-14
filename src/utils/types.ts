export type AnyFunction = (...args: any[]) => any;
// Fn with no args that returns T;
export type GetterFn<T> = () => T;

export type MaybeGetter<T> = T | GetterFn<T>;

export type SetThis<Fn extends AnyFunction, This> = Fn extends (
  ...args: infer Args
) => infer R
  ? (this: This, ...args: Args) => R
  : never;

// Instead of an array of all union types, will spread type to make each part of union it's own array
export type SpreadToArray<T> = T extends any ? T[] : never;

export type ArrayItemType<T> = T extends Array<infer I> ? I : never;

export type IsSingleTypeArray<Type, True, False = never> = Type extends Array<
  infer I
>
  ? // Spread I if it's a union
    I extends any
    ? Type extends Array<I>
      ? True
      : False
    : False
  : False;

export type TypeCheckFn<T> = (input: unknown) => input is T;
