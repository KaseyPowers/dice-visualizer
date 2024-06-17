import ProcessProbabilities from "@/components/process";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>Displaying "d20 + d4"</div>
      <ProcessProbabilities />
    </main>
  );
}
