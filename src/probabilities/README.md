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

# Examples

- `{1: 1, 2: 2, 3: 3, 4: 4} + [1, 2]`

  - `[1, 2, 2, 3,3, 3, 4, 4, 4 4] + [1, 2]`
  - `[2, 3, 3, 4, 4, 4, 5, 5, 5, 5], [3, 4, 4, 5, 5, 5, 6, 6, 6, 6]`
  - `[2, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6]`
  - `{2: 1, 3: 3, 4: 5, 5: 7, 6: 4}`
  - Or `{ (1 + 1): 1*1, (1+2): 2*1, (1+3): 3*1 (1+4): 4*1, (2+1): 1*1, ... }`

- `[1, 1, 2, 3] + [1, 1, 2, 3]` Or `{1: 2, 2: 1, 3: 1} + {1: 2, 2: 1, 3: 1}`
  - `[2, 2, 3, 4], [2, 2, 3, 4], [3, 3, 4, 5], [4, 4, 5, 6]` or `{(1 + 1): 2 * 2, (1 + 2): 2 * 1, (1 + 3): 2 * 1, (2 + 1): 1 * 2, (2 + 2): 1 * 1, (2 + 3): 1 * 1, (3+ 1): 1 * 2, (3+2): 1 * 1, (3+3): 1*1}`
  - `{2: 4, 3:4, 4: 5, 5: 2, 6: 1}` or `{2: 4, 3: 2, 4: 2, 3: 2, 4: 1, 5: 1, 4: 2, 5: 1, 6: 1}`
  - or `{2: 4, 3: (2 + 2), 4: (2 + 1 + 2), 5: (1 + 1), 6: 1}` = `{2: 4, 3: 4, 4: 5, 5: 2, 6: 1}`

Explode d4:

- `fn(D) { helperFn(D); } - helperFn(N) { N = 4 { return N + D; } return N}`
- `returns: [1, 2, 3, 4 + [1, 2, 3, 4]] = [1, 2, 3, 5, 6, 7, 8]` This mixing is wrong...
- `{1: 1, 2: 1, 3: 1, (4 + {1: 1, 2: 1, 3: 1, 4: 1}): 1}` so mixing that type into a value. For all other values, we do a ratio it seems.
  - `{1: 1, 2: 1, 3: 1} w/ [{5: 1, 6: 1, 7: 1, 8: 1}: 1] = {1: 4, 2: 4, 3: 4, 5: 1, 6: 1, 7: 1, 8: 1}`
- if the dice was instead `[1, 1, 2, 3, 4]`:

  - `{1: 2, 2: 1, 3: 1, (4 + {1: 2, 2: 1, 3: 1, 4: 1}): 1}` outer total count: 5, inner count: 5 so I think this is logic: 5/5= 1, for each value inside, add 1 to rest of counts
  - `{1: 7, 2: 6, 3: 6, 5: 2, 6: 1, 7: 1, 4: 1}` total count: 24 NOPE
  - new idea, out count 5, inner count 5, so new total count would be: `5*5 = 25`. For each existing number: `(count/outer total)*combined total= new total` : `(count/outer total) * (outer total * inner total)` : `(count * inner total)`.
    - `{1: 10, 2: 5, 3: 5, 5: 2, 6: 1, 7: 1, 4: 1}` that works!

- `same but helperFn(N) { if N = 4 { return N + d5 } return N}`

  - `{1: 1, 2: 1, 3: 1, (4 + {1: 1, 2: 1, 3: 1, 4: 1, 5: 1}): 1}` inner total = 5;
  - `{1: 5, 2: 5, 3: 5, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1}` total = 20 (4 \* 5), counts: `5 = 25%, 1: 5%`

  - `{1: 1, 2: 1, 3: 1, (4 + {1: 1, 2: 1, 3: 1, 4: 1, 5: 1}): 2}` inner total = 5; outer total = 5
  - `{1: 5, 2: 5, 3: 5, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2}` total = 25 (5 \* 5), counts: `5 = 25%, 1: 5%`

- Can I use the above logic to "simplify" adding values?
  - `{1: 1, 2: 2, 3: 3, 4: 4} + [1, 2]`: left side inner total: 10
  - `{ (1 + {1: 1, 2: 2, 3: 3, 4: 4}): 1, (2 + {1: 1, 2: 2, 3: 3, 4: 4})): 1 }`
  - `{ 2: 1, 3: 2, 4: 3, 5: 4, ({3: 1, 4: 2, 5: 3, 6: 4}): 10}`
  - `{ 2: 10, 3: 20, 4: 30, 5: 40, 3: 10, 4: 20, 5: 30, 6: 40}`
  - `{ 2: 10, 3: 30, 4: 50, 5: 70, 6: 40}` -> `{2: 1, 3: 3, 4: 5, 5: 7, 6: 4}`
