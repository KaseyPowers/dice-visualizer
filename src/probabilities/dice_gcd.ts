function makeOdd(input: number): number {
  let output = input;
  while (!(output & 1)) {
    output >>= 1;
  }
  return output;
}
function binary_gcd(first: number, second: number): number {
  // Binary operand for 2^x: 1 << x OR: N * 2^x: N << x
  // Binary even check: !(i & 1)
  // Binary divide by 2: i >> 1
  let a = first;
  let b = second;
  let commonD = 0;
  // while both are even, count shared divisions
  while (!(a & 1) && !(b & 1)) {
    commonD++;
    a >>= 1;
    b >>= 1;
  }
  // at least one could still be even, so check both
  a = makeOdd(a);
  b = makeOdd(b);

  while (true) {
    if (a & 1 || b & 1) {
      throw new Error("Expect both odd");
    }
    // we want a <= b so swap if needed
    if (a > b) {
      let c = a;
      a = b;
      b = c;
    }
    // From Identity: gcd(a, b) = gcd(a, b-a) when a <= b and both odd
    b -= a;
    if (!b) {
      break;
    }
    // after b-a, b will be even, so make odd again (function skips for 0)
    makeOdd(b);
  }
  return a << commonD;
}

function validateGCDInput(input: number[]) {
  if (input.length <= 1) {
    throw new Error("Expected at least 2 numbers for dice gcd");
  }
  if (input.some((val) => val < 1)) {
    throw new Error("Expected every count to be at least 1");
  }
}
// making sure to specify that this is for dice and so we can do some validation and other steps to simplify
export function dice_gcd(input: number[]): number {
  validateGCDInput(input);
  // sort the input values for simplicity
  const counts = input.toSorted((a, b) => a - b);
  // the gcd(a, a) = a so just assign first count as starting output;
  let output = counts[0];
  // exit out of loop as soon as output is 1
  for (let i = 1; i < counts.length && output !== 1; i += 1) {
    output = binary_gcd(output, counts[i]);
  }
  return output;
}
