export type PartPartial<Type, Keys extends keyof Type> = Omit<Type, Keys> &
  Partial<Pick<Type, Keys>>;
// https://github.com/joonhocho/tsdef/tree/master
// https://github.com/Microsoft/TypeScript/issues/26051
export type ExtendExact<T, X extends T> = T & {
  [K in keyof X]: K extends keyof T ? X[K] : never;
};
// U extends Exact<{ [K in keyof T]-?: (v: T[K]) => any }, U>

export type AnyFunction = (...args: any[]) => any;
// Fn with no args that returns T;
export type GetterFn<T> = () => T;

export type MaybeGetter<T> = T | GetterFn<T>;

export type SetThis<Fn extends AnyFunction, This> =
  Fn extends (...args: infer Args) => infer R ? (this: This, ...args: Args) => R
  : never;

// Instead of an array of all union types, will spread type to make each part of union it's own array
export type SpreadToArray<T> = T extends any ? T[] : never;

export type ArrayItemType<T> = T extends Array<infer I> ? I : never;

// Simple check if they extend each other without spreading
type IsExact<A, B, True, False> =
  [A] extends [B] ?
    [B] extends [A] ?
      True
    : False
  : False;

// type checkExact1 = IsExact<string, string, 1, 0>;
// type checkExact2 = IsExact<number | string, string, 1, 0>;
// type checkExact3 = IsExact<string, number | string, 1, 0>;
// type checkExact4 = IsExact<string | number, number | string, 1, 0>;

// This test will return true if the type is an array build of Array<Types> and not a tuple-like array
export type IsSingleTypeArray<Type, True, False = never> =
  Type extends Array<infer I> ?
    Array<I> extends Type ? True
    : IsUnion<I, 0, 1> extends 1 ? True
    : 0 extends (
      {
        [K in keyof Type]: IsExact<Type[K], I, 1, 0>;
      }[number]
    ) ?
      False
    : True
  : False;

// // Test cases for singleTypeArray
// // expect True results
// type testSimple = IsSingleTypeArray<Array<string>, 1, 0>;
// type testSimpleUnion = IsSingleTypeArray<Array<string | number>, 1, 0>;
// type testSingleTypeTuple = IsSingleTypeArray<[string, string], 1, 0>;
// type testConsistentUnionTuple = IsSingleTypeArray<
//   [string | number, string | number],
//   1,
//   0
// >;
// // expect False
// type testChangingTuple = IsSingleTypeArray<[string, number], 1, 0>;
// type testMixedChangingTuple = IsSingleTypeArray<
//   [string, number, string | number],
//   1,
//   0
// >;
// This is false, but could want to treat it as truthy?

type testNonArray = IsSingleTypeArray<string, 1, 0>;

export type TypeCheckFn<T> = (input: unknown) => input is T;

// export type IfArrayContainsAll<
//   Expected,
//   Arr extends Array<Expected> | ReadonlyArray<Expected>
// > = Arr & ([Expected] extends [Arr[number]] ? unknown : never);

// To test if union, put two copies in the _IsUnion type, then spread one and compare if it changed.
type _IsUnion<A, B, True, False> =
  B extends any ?
    [A] extends [B] ?
      False
    : True
  : never;
export type IsUnion<Type, True, False = never> = _IsUnion<
  Type,
  Type,
  True,
  False
>;
export type IfUnion<Type, Fallback = never> = IsUnion<Type, Type, Fallback>;
export type IfNotUnion<Type, Fallback = never> = IsUnion<Type, Fallback, Type>;
