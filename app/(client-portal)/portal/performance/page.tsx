"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { format } from "date-fns";


interface MarketingMetric {
  id: string;
  date: string;
  spend: number;
  revenue: number;
  leads: number;
  sales: number;
  roas: number;
  utm_campaign: string;
  utm_source: string;
  platform: string;
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<MarketingMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('client_id')
          .eq('id', user.id)
          .single();

        if (profile?.client_id) {
          const { data } = await supabase
            .from('marketing_metrics')
            .select('*')
            .eq('client_id', profile.client_id)
            .order('date', { ascending: true });
          
          setMetrics((data as MarketingMetric[]) || []);
        }
      } catch (err) {
        console.error("Error loading metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) return <div className="p-8 text-zinc-500 animate-pulse">Carregando métricas...</div>;

  const chartData = metrics.map(m => ({
    name: format(new Date(m.date), "dd/MM"),
    spend: Number(m.spend),
    revenue: Number(m.revenue || 0),
    leads: m.leads
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Performance & Métricas</h1>
        <p className="text-zinc-500 mt-1">Dados detalhados das campanhas de tráfego pago.</p>
      </div>

      {/* Main Chart: Spend vs Revenue */}
      <Card className="bg-zinc-900/50 border-white/5 p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg">Investimento vs. Retorno (ROI)</CardTitle>
          <CardDescription>Comparativo de valor gasto em anúncios vs faturamento gerado.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#79cd25" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#79cd25" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#52525b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#52525b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `R$${value}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #ffffff10', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey="spend" 
                name="Investimento"
                stroke="#79cd25" 
                fillOpacity={1} 
                fill="url(#colorSpend)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                name="Receita"
                stroke="#ec4899" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Campaign Table */}
      <Card className="bg-zinc-900/50 border-white/5">
        <CardHeader>
          <CardTitle className="text-lg">Tabela de Campanhas (UTM)</CardTitle>
          <CardDescription>Breakdown detalhado por origem e campanha.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-zinc-500 uppercase text-[10px] font-bold">Fonte / Campanha</TableHead>
                <TableHead className="text-zinc-500 uppercase text-[10px] font-bold">Investido</TableHead>
                <TableHead className="text-zinc-500 uppercase text-[10px] font-bold">Leads</TableHead>
                <TableHead className="text-zinc-500 uppercase text-[10px] font-bold">Vendas</TableHead>
                <TableHead className="text-zinc-500 uppercase text-[10px] font-bold">ROAS</TableHead>
                <TableHead className="text-zinc-500 uppercase text-[10px] font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.length > 0 ? metrics.map((m) => (
                <TableRow key={m.id} className="border-white/5 hover:bg-white/2 transition-colors">

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{m.utm_campaign || 'Campanha Principal'}</span>
                      <span className="text-xs text-zinc-500">{m.platform} ({m.utm_source})</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-300">R$ {Number(m.spend).toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-sm text-zinc-300">{m.leads}</TableCell>
                  <TableCell className="text-sm text-zinc-300">{m.sales}</TableCell>
                  <TableCell className="text-sm font-bold text-emerald-500">{Number(m.roas).toFixed(2)}x</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px]">Ativa</Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-zinc-600">Sem dados de campanha no período.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

