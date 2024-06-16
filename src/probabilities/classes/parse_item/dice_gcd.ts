import { DataEntryType } from "../../types/types";

// Build based on article here: https://en.wikipedia.org/wiki/Binary_GCD_algorithm
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
    a >>>= 1;
    b >>>= 1;
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

/** Working with entry array directly to hopefully aid efficiency */
export function dice_entry_gcd(input: DataEntryType[]): number {
  if (input.length <= 1) {
    throw new Error("Expected at least 2 inputs in order to get a gcd value");
  }
  let output = input[0][1];
  // Trying using a while loop, as it can be more effient as a way to iterate through the array
  let index = 1;
  while (output !== 1 && index < input.length) {
    const count = input[index][1];
    if (count < 1) {
      throw new Error("Expected every count to be greater than or equal to 1");
    }
    output = binary_gcd(output, count);
    index++;
  }
  return output;
}

// This assumes we have a final set of entries, and will make sure we use the smallest counts possible while retaining the probabilities of each
export function minimizeEntryCounts(input: DataEntryType[]): DataEntryType[] {
  const gcd = dice_entry_gcd(input);
  return gcd > 1 ? input.map(([val, count]) => [val, count / gcd]) : input;
}
