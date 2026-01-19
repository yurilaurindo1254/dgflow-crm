"use client";

import { useState } from "react";
import { ReactFlow, Background, Controls, useNodesState, useEdgesState } from "@xyflow/react";
import '@xyflow/react/dist/style.css';

import { MetricNode } from "@/components/funnel/MetricNode";
import { CreativeTable } from "@/components/funnel/CreativeTable";
import { 
  Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/ui/date-range-picker";

// Dados Mockados para o Exemplo
const INITIAL_NODES = [
  { id: '1', type: 'metric', position: { x: 0, y: 100 }, data: { label: 'Tráfego Pago', type: 'traffic', value: 15400, count: 5200, conversionRate: 1.2, roi: -20 } },
  { id: '2', type: 'metric', position: { x: 400, y: 100 }, data: { label: 'Página de Vendas', type: 'page', value: 0, count: 3100, conversionRate: 60, roi: 0 } },
  { id: '3', type: 'metric', position: { x: 800, y: 100 }, data: { label: 'Checkout', type: 'page', value: 0, count: 800, conversionRate: 25, roi: 0 } },
  { id: '4', type: 'metric', position: { x: 1200, y: 100 }, data: { label: 'Compra Confirmada', type: 'sale', value: 45000, count: 210, conversionRate: 26, roi: 290 } },
];

const INITIAL_EDGES = [
  { id: 'e1-2', source: '1', target: '2', animated: true, label: '60%' },
  { id: 'e2-3', source: '2', target: '3', animated: true, label: '25%' },
  { id: 'e3-4', source: '3', target: '4', animated: true, label: '26%' },
];

const MOCK_CREATIVES = [
    { id: '1', name: 'AD_01_FEED_VID', thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&q=80', preview: 'https://www.w3schools.com/html/mov_bbb.mp4', type: 'video' as const, spend: 1200, roas: 3.5, hookRate: 45, holdRate: 12 },
    { id: '2', name: 'AD_02_STORY_IMG', thumbnail: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=100&q=80', preview: '', type: 'image' as const, spend: 800, roas: 1.2, hookRate: 0, holdRate: 0 },
];

const MOCK_CHART_DATA = Array.from({ length: 30 }, (_, i) => ({
    date: `Dia ${i+1}`,
    investimento: Math.floor(Math.random() * 5000) + 1000,
    faturamento: Math.floor(Math.random() * 15000) + 2000,
    leads: Math.floor(Math.random() * 200),
}));

const nodeTypes = { metric: MetricNode };

export default function LaunchDashboardPage() {
  const [nodes, , onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, , onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const onNodeClick = (_: React.MouseEvent, node: { id: string }) => {
      setSelectedNode(node.id);
  };

  return (
    <div className="min-h-screen bg-black space-y-6 p-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-primary-500 border-primary-500/50">AO VIVO</Badge>
                <h1 className="text-2xl font-bold text-white">Lançamento Meteórico Jan/26</h1>
              </div>
              <p className="text-zinc-400 text-sm">Atualizado há 5 minutos</p>
          </div>
          <DateRangePicker />
      </div>

      {/* Seção 1: O Funil Visual (React Flow) */}
      <div className="h-[500px] w-full border border-white/10 rounded-xl overflow-hidden bg-zinc-950 relative group">
          <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md p-2 rounded-lg border border-white/5">
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Visão do Funil</p>
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-zinc-950"
          >
            <Background color="#333" gap={20} size={1} />
            <Controls className="bg-zinc-900 border-white/10 fill-white" />
          </ReactFlow>
      </div>

      {/* Seção 2: Dashboard Geral (KPIs e Gráficos) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Gráfico Principal: Investimento vs Faturamento */}
          <Card className="lg:col-span-2 bg-zinc-900/50 border-white/5">
              <CardHeader>
                  <CardTitle className="text-sm font-medium text-zinc-400">Evolução Diária (R$)</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={MOCK_CHART_DATA}>
                          <defs>
                              <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                          <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#666" fontSize={10} tickFormatter={(val) => `R$${val/1000}k`} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Area type="monotone" dataKey="faturamento" stroke="#ec4899" fillOpacity={1} fill="url(#colorFat)" strokeWidth={2} />
                          <Bar dataKey="investimento" fill="#3b82f6" opacity={0.5} radius={[4, 4, 0, 0]} />
                      </ComposedChart>
                  </ResponsiveContainer>
              </CardContent>
          </Card>

          {/* Gráfico Secundário: Demográfico / Score */}
          <Card className="bg-zinc-900/50 border-white/5">
              <CardHeader>
                  <CardTitle className="text-sm font-medium text-zinc-400">Qualidade do Tráfego</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[300px] relative">
                  {/* Gauge Simulado com CSS/SVG */}
                  <div className="relative w-48 h-48">
                      <svg className="w-full h-full transform -rotate-90">
                          <circle cx="96" cy="96" r="88" stroke="#333" strokeWidth="12" fill="none" />
                          <circle cx="96" cy="96" r="88" stroke="#10b981" strokeWidth="12" fill="none" strokeDasharray="552" strokeDashoffset="100" className="transition-all duration-1000 ease-out" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-bold text-white">82</span>
                          <span className="text-xs text-emerald-500 font-bold uppercase mt-1">Excelente</span>
                      </div>
                  </div>
              </CardContent>
          </Card>
      </div>

      {/* Drawer: Análise Detalhada (Drill-Down) */}
      <Sheet open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
          <SheetContent className="w-full sm:max-w-3xl bg-zinc-950 border-l border-white/10 overflow-y-auto">
              <SheetHeader className="mb-6">
                  <SheetTitle className="text-2xl font-bold text-white flex items-center gap-2">
                      <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/20">Meta Ads</Badge>
                      Análise de Tráfego
                  </SheetTitle>
                  <SheetDescription>Detalhamento de campanhas e criativos para esta etapa.</SheetDescription>
              </SheetHeader>

              <Tabs defaultValue="creatives" className="w-full">
                  <TabsList className="bg-zinc-900 border border-white/10 w-full justify-start rounded-lg p-1 mb-6">
                      <TabsTrigger value="creatives" className="data-[state=active]:bg-zinc-800">Criativos</TabsTrigger>
                      <TabsTrigger value="campaigns" className="data-[state=active]:bg-zinc-800">Campanhas</TabsTrigger>
                      <TabsTrigger value="audience" className="data-[state=active]:bg-zinc-800">Públicos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="creatives" className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                      {/* Filtros da Tabela */}
                      <div className="flex gap-2 mb-4">
                          <Badge variant="outline" className="cursor-pointer hover:bg-white/5">Videos</Badge>
                          <Badge variant="outline" className="cursor-pointer hover:bg-white/5">Imagens</Badge>
                      </div>
                      
                      {/* Tabela Rica */}
                      <CreativeTable creatives={MOCK_CREATIVES} />
                  </TabsContent>
              </Tabs>
          </SheetContent>
      </Sheet>

    </div>
  );
}
