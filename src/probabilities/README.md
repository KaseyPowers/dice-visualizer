# Starting Point

From what I can tell, the easiest way to handle the output probabilities is to treat it as an array/collectiong/etc. of each potential output, with each value having a 1/total% chance.

An array would be the easiest way to handle this in terms of logic between points. but could balloon quickly with multiple operations. So a map/obj would potentially help assuming the ballooning values are not also in the range of values.

dice as array: `d4 = [1, 2, 3, 4]`
adding a value: `[1, 2, 3, 4] + 1 = [2, 3, 4, 5]`
adding arrays: `[1, 2, 3, 4] + [1, 2] = [ [2, 3, 4, 5], [3, 4, 5, 6] ] = [2, 3, 4, 5, 3, 4, 5, 6]` here you can see how quickly it grows from just adding a d2, could also be represented as `{ 2: 1, 3: 2, 4: 2, 5: 2, 6: 1}`

## Data Types

- Data Variable: staring point for the rest, starting with `number`
- Data Array: `number[]` ordered list
- Data Set: `Map<number, number>` for unordered sets of data
- Data Collection: Array of the any of the above values

## Data Conversions

when running any logic, need to define the rules for how they will behave

- Data Variable: use as is, if expecting any of the other values, they are an array/map with only one value
- Data Array: if
