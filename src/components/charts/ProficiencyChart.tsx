"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ProficiencyChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
}

export default function ProficiencyChart({ data }: ProficiencyChartProps) {
  // Filter out any 0 values so they don't show in legend if empty
  const activeData = data.filter(d => d.value > 0);

  if (activeData.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-muted-foreground">No skills tracked yet.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={activeData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={75}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {activeData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--background)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          itemStyle={{ color: 'var(--foreground)', fontWeight: 500 }}
        />
        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
