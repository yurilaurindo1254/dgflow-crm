"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  name: string;
  income: number;
  expense: number;
}

interface CashFlowChartProps {
  data: DataPoint[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis 
            dataKey="name" 
            stroke="#71717a" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#71717a', fontWeight: 500 }}
            dy={10}
        />
        <YAxis 
            stroke="#71717a" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `R$ ${value}`}
            tick={{ fill: '#71717a', fontWeight: 500 }}
        />
        <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)', radius: 8 }}
        />
        <Bar 
          dataKey="income" 
          name="Receitas" 
          fill="url(#incomeGradient)" 
          radius={[6, 6, 0, 0]} 
          barSize={32}
        />
        <Bar 
          dataKey="expense" 
          name="Despesas" 
          fill="#3f3f46" 
          radius={[6, 6, 0, 0]} 
          barSize={32}
        />
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ec4899" stopOpacity={1} />
            <stop offset="100%" stopColor="#db2777" stopOpacity={0.8} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl space-y-3 min-w-[200px]">
        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: { fill: string; name: string; value: number }, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill === 'url(#incomeGradient)' ? '#ec4899' : entry.fill }} />
                <span className="text-sm font-medium text-zinc-300">{entry.name}</span>
              </div>
              <span className="text-sm font-bold text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

