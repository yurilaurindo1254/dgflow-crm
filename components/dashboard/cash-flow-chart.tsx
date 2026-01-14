"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useSettings } from "@/contexts/settings-context";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils/format";


function CustomTooltip({ 
  active, 
  payload, 
  label, 
  language, 
  currency 
}: { 
  active?: boolean; 
  payload?: { name: string; value: number; color?: string; payload: { fill?: string } }[];
  label?: string; 
  language?: string; 
  currency?: string; 
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl space-y-3 min-w-[200px]">
        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: { name: string; value: number; color?: string; payload: { fill?: string } }, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: entry.payload.fill === 'url(#incomeGradient)' ? '#ec4899' : (entry.payload.fill || entry.color) }} 
                />
                <span className="text-sm font-medium text-zinc-300">{entry.name}</span>
              </div>
              <span className="text-sm font-bold text-white">
                {formatCurrencyUtil(entry.value as number, currency, language)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

interface CashFlowChartProps {
  data: {
    name: string;
    income: number;
    expense: number;
  }[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const { language, currency } = useSettings();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        barGap={12}
      >
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ec4899" stopOpacity={1} />
            <stop offset="100%" stopColor="#be185d" stopOpacity={1} />
          </linearGradient>
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#71717a', fontSize: 12, fontWeight: 500 }}
          dy={10}
        />
        <YAxis 
          hide 
          axisLine={false} 
          tickLine={false} 
        />
        <Tooltip 
          content={<CustomTooltip language={language} currency={currency} />}
          cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }}
        />
        <Bar 
          dataKey="income" 
          name="Receita"
          fill="url(#incomeGradient)" 
          radius={[6, 6, 0, 0]} 
          barSize={40}
        />
        <Bar 
          dataKey="expense" 
          name="Despesa"
          fill="url(#expenseGradient)" 
          stroke="rgba(255,255,255,0.1)"
          radius={[6, 6, 0, 0]} 
          barSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
