// Build based on article here: https://en.wikipedia.org/wiki/Binary_GCD_algorithm
export function makeOdd(input: number): number {
  let output = input;
  while (!(output & 1)) {
    output >>>= 1;
  }
  return output;
}
export function binary_gcd(first: number, second: number): number {
  // Binary operand for 2^x: 1 << x OR: N * 2^x: N << x
  // Binary even check: !(i & 1)
  // Binary divide by 2: i >> 1
  let a = first;
  let b = second;
  let commonD = 0;
  // while both are even, count shared divisions
  while (!(a & 1) && !(b & 1)) {
    commonD++;
    a >>>= 1;
    b >>>= 1;
  }
  // at least one could still be even, so check both
  a = makeOdd(a);
  b = makeOdd(b);

  while (true) {
    if (!(a & 1) || !(b & 1)) {
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
    b = makeOdd(b);
  }
  return a << commonD;
}

export function array_gcd(input: number[]) {
  if (input.length < 1) {
    throw new Error("Expected at least 1 values");
  }
  let output = input[0];
  for (let i = 1; i < input.length && output !== 1; i += 1) {
    const value = input[i];
    if (value < 1) {
      throw new Error("Expected every number to be greater than or equal to 1");
    }
    output = binary_gcd(output, value);
  }
  return output;
}
