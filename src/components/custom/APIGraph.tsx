"use client";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type DataPoint = { label: string; value: number };

export default function APIGraph() {
  const [data, setData] = useState<DataPoint[]>([]);

  const config = {
    value: {
      label: "Valor",
      color: "hsl(var(--chart-1))",
    },
  };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/data")
      .then((res) => res.json())
      .then((json) =>
        setData(
          json.map((item: any) => ({
            label: item.name,
            value: item.value,
          }))
        )
      );
  }, []);

  if (!data.length) return <div className="p-4">Cargando...</div>;

  return (
    <ChartContainer config={config} className="min-h-[300px] w-full">
      {/* ResponsiveContainer hace que nunca se salga */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="label" />
          <YAxis />
          <Bar dataKey="value" fill="var(--chart-1)" />
          <ChartTooltip content={<ChartTooltipContent />} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

