"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  MousePointer2, 
  Target, 
  Plus, 
  RefreshCcw,
  LucideIcon
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

const MOCK_DATA = [
  { date: '2024-01-01', spend: 120, revenue: 450, conversions: 12 },
  { date: '2024-01-02', spend: 150, revenue: 580, conversions: 15 },
  { date: '2024-01-03', spend: 200, revenue: 890, conversions: 22 },
  { date: '2024-01-04', spend: 180, revenue: 760, conversions: 18 },
  { date: '2024-01-05', spend: 250, revenue: 1200, conversions: 30 },
  { date: '2024-01-06', spend: 300, revenue: 1500, conversions: 35 },
  { date: '2024-01-07', spend: 280, revenue: 1100, conversions: 28 },
];

export default function PerformancePage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date()
  });

  const totalSpend = MOCK_DATA.reduce((acc, curr) => acc + curr.spend, 0);
  const totalRevenue = MOCK_DATA.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalConversions = MOCK_DATA.reduce((acc, curr) => acc + curr.conversions, 0);
  const roas = totalRevenue / totalSpend;
  const cpa = totalSpend / totalConversions;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Performance ADS</h1>
          <p className="text-zinc-500 mt-1">Gestão de tráfego e análise de ROI em tempo real.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <DateRangePicker 
            value={dateRange}
            onChange={setDateRange}
          />
          <Button className="bg-primary-500 hover:bg-primary-600 text-black font-bold gap-2">
            <Plus size={18} />
            Conectar Conta
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Investimento" 
          value={`R$ ${totalSpend.toLocaleString('pt-BR')}`}
          icon={DollarSign}
          description="Total gasto no período"
          trend="+12.5%"
        />
        <KpiCard 
          title="Faturamento" 
          value={`R$ ${totalRevenue.toLocaleString('pt-BR')}`}
          icon={TrendingUp}
          description="Retorno direto rastreado"
          trend="+24.2%"
        />
        <KpiCard 
          title="ROAS Total" 
          value={roas.toFixed(2)}
          icon={Target}
          description="Retorno sobre investimento"
          color="text-emerald-500"
        />
        <KpiCard 
          title="CPA Médio" 
          value={`R$ ${cpa.toFixed(2)}`}
          icon={MousePointer2}
          description="Custo por conversão"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2 bg-zinc-900/50 border-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="size-5 text-primary-500" />
              Eficiência das Campanhas
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_DATA}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#79cd25" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#79cd25" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#52525b" 
                  fontSize={12}
                  tickFormatter={(val) => format(new Date(val), 'dd/MM')}
                />
                <YAxis yAxisId="left" stroke="#52525b" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#52525b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff' }}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="spend" 
                  name="Investimento"
                  stroke="#79cd25" 
                  fillOpacity={1} 
                  fill="url(#colorSpend)" 
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="conversions" 
                  name="Conversões"
                  stroke="#3b82f6" 
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Integration Status / Tips */}
        <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Integridade de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-500 mb-1">
                <RefreshCcw size={16} />
                <span className="text-xs font-bold uppercase">Meta Ads Ativo</span>
              </div>
              <p className="text-xs text-zinc-400">Sincronizado há 15 minutos. 12 campanhas ativas rastreadas.</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-800/50 border border-white/5 opacity-50">
              <div className="flex items-center gap-2 text-zinc-500 mb-1">
                <Plus size={16} />
                <span className="text-xs font-bold uppercase">Google Ads</span>
              </div>
              <p className="text-xs text-zinc-500">Conecte sua conta do Google Ads para unificar métricas.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, description, trend, color = "text-white" }: {
  title: string;
  value: string;
  icon: LucideIcon;
  description: string;
  trend?: string;
  color?: string;
}) {
  return (
    <Card className="bg-zinc-900/50 border-white/5 hover:border-white/10 transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-white/5">
            <Icon className="size-5 text-primary-500" />
          </div>
          {trend && (
            <Badge variant="outline" className="text-[10px] font-bold text-emerald-500 bg-emerald-500/5 border-emerald-500/20">
              {trend}
            </Badge>
          )}
        </div>
        <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">{title}</span>
        <h2 className={`text-2xl font-bold mt-1 ${color}`}>{value}</h2>
        <p className="text-[10px] text-zinc-600 mt-1 uppercase">{description}</p>
      </CardContent>
    </Card>
  );
}
