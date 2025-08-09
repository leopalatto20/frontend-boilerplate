import APIGraph from "@/components/custom/APIGraph";

export default function Output() {
  return (
    <main className="p-4 space-y-6 max-w-full">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Datos cargados desde la API y mostrados en la gráfica:
      </p>
      <div className="w-full">
        <APIGraph />
      </div>
    </main>
  );
}
