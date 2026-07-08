"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PriorityChartProps {
  data: any[];
}

export default function PriorityChart({ data }: PriorityChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
        <YAxis axisLine={false} tickLine={false} fontSize={12} allowDecimals={false} />
        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
