"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

type SkillRadarChartProps = {
  data: {
    category: string;
    score: number;
    fullMark: number;
  }[];
};

export function SkillRadarChart({ data }: SkillRadarChartProps) {
  // If no data, show a flat shape
  const plotData = data.length > 0 ? data : [
    { category: "Languages", score: 0, fullMark: 100 },
    { category: "Frontend", score: 0, fullMark: 100 },
    { category: "Backend", score: 0, fullMark: 100 },
    { category: "DevOps", score: 0, fullMark: 100 },
    { category: "Fundamentals", score: 0, fullMark: 100 },
    { category: "AI & ML", score: 0, fullMark: 100 },
  ];

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={plotData}>
          <PolarGrid stroke="var(--border)" className="opacity-50" />
          <PolarAngleAxis 
            dataKey="category" 
            tick={{ fill: "var(--muted-foreground)", fontSize: 12, fontWeight: 500 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))", 
              borderColor: "hsl(var(--border))",
              borderRadius: "0.5rem",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
            }}
            itemStyle={{ color: "hsl(var(--primary))", fontWeight: 600 }}
            formatter={(value: number) => [`${Math.round(value)}%`, "Proficiency"]}
          />
          <Radar 
            name="Skill Stack" 
            dataKey="score" 
            stroke="hsl(var(--primary))" 
            fill="hsl(var(--primary))" 
            fillOpacity={0.3} 
            isAnimationActive={true}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
