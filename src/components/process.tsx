"use client";
import { Probability } from "@/probabilities";
import DisplayProbabilityResults from "./results";

const result = new Probability("d20").operation("+", new Probability("d4"));
export default function ProcessProbabilities() {
  return <DisplayProbabilityResults items={{ label: "test", item: result }} />;
}
