"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Target,
  Layers,
  Image as ImageIcon,
  Zap,
  Globe,
  Smartphone,
  Tag
} from "lucide-react";
import { PerformanceTable, PerformanceData } from "./PerformanceTable";
import { cn } from "@/lib/utils";

export interface NodeData {
  type: string;
  label: string;
  spend?: string | number;
  sales?: string | number;
  clicks?: string | number;
  visits?: string | number;
  scroll?: string | number;
  checkouts?: string | number;
  abandonment?: string | number;
  aov?: string | number;
  sparkline?: { v: number }[];
}

interface NodeDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  nodeData: NodeData | null;
}

const MOCK_TRAFFIC_DATA: PerformanceData[] = [
  { id: '1', name: 'Escala_Broad_Lookalike_Brasil', spend: 850.20, cpm: 12.50, cpc: 1.45, ctr: 2.8, conversions: 45, cpa: 18.89, roas: 3.4, status: 'active', thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop' },
  { id: '2', name: 'Retargeting_Visitantes_7D', spend: 240.50, cpm: 18.20, cpc: 2.10, ctr: 1.5, conversions: 12, cpa: 20.04, roas: 1.8, status: 'active', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop' },
  { id: '3', name: 'Lookalike_Compradores_1%', spend: 1200.00, cpm: 10.15, cpc: 0.95, ctr: 3.5, conversions: 110, cpa: 10.90, roas: 5.2, status: 'active', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop' },
  { id: '4', name: 'Interesses_Empreendedorismo_Jan', spend: 150.00, cpm: 8.50, cpc: 1.20, ctr: 1.2, conversions: 2, cpa: 75.00, roas: 0.4, status: 'paused' },
];

export function NodeDetailsSheet({ isOpen, onOpenChange, nodeData }: NodeDetailsSheetProps) {
  if (!nodeData) return null;

  const isTrafficNode = nodeData.type === 'ad_source';

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[85vw] sm:w-[70vw] lg:w-[60vw] bg-zinc-950 border-white/10 text-white p-0 overflow-y-auto">
        {/* Sticky Header with Macro Metrics */}
        <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-500 shadow-[0_0_20px_rgba(121,205,37,0.1)]">
                      <BarChart3 size={24} />
                  </div>
                  <div>
                    <SheetTitle className="text-2xl font-bold text-white tracking-tight">{nodeData.label}</SheetTitle>
                    <SheetDescription className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest flex items-center gap-2">
                      <TrendingUp size={10} className="text-primary-500" />
                      Análise Profunda • Últimos 30 dias
                    </SheetDescription>
                  </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <HeaderMetric label="Investimento" value={`R$ ${nodeData.spend || '0'}`} icon={DollarSign} />
              <div className="w-px h-8 bg-white/5 mx-2 hidden lg:block" />
              <HeaderMetric label="Vendas" value={nodeData.sales || (isTrafficNode ? '167' : '0')} icon={Target} color="text-emerald-500" />
              <div className="w-px h-8 bg-white/5 mx-2 hidden lg:block" />
              <HeaderMetric label="ROAS Médio" value="3.45x" icon={Zap} color="text-primary-500" />
            </div>
          </div>
        </div>

        <Tabs defaultValue={isTrafficNode ? "campaigns" : "sources"} className="w-full">
          <div className="px-6 border-b border-white/5 bg-zinc-900/30">
            <TabsList className="bg-transparent border-none h-14 gap-8">
                {isTrafficNode ? (
                  <>
                    <TabTrigger value="campaigns" icon={Layers} label="Campanhas" />
                    <TabTrigger value="ads" icon={Target} label="Anúncios" />
                    <TabTrigger value="creatives" icon={ImageIcon} label="Criativos" />
                  </>
                ) : (
                  <>
                    <TabTrigger value="sources" icon={Globe} label="Origens" />
                    <TabTrigger value="devices" icon={Smartphone} label="Dispositivos" />
                    <TabTrigger value="utms" icon={Tag} label="UTMs" />
                  </>
                )}
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="campaigns" className="m-0 focus-visible:ring-0">
               <PerformanceTable data={MOCK_TRAFFIC_DATA} type="campaign" />
            </TabsContent>
            
            <TabsContent value="ads" className="m-0 focus-visible:ring-0">
               <PerformanceTable data={MOCK_TRAFFIC_DATA.slice(0, 3)} type="ad" />
            </TabsContent>

            <TabsContent value="creatives" className="m-0 focus-visible:ring-0">
               <PerformanceTable data={MOCK_TRAFFIC_DATA.filter(i => i.thumbnail)} type="creative" />
            </TabsContent>

            <TabsContent value="sources" className="m-0 focus-visible:ring-0">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Top Origens (Canal)</h3>
                    <div className="space-y-4">
                      <SourceRow label="Meta Ads" value="4.250" percentage={65} color="bg-blue-500" />
                      <SourceRow label="Google Ads" value="1.820" percentage={25} color="bg-orange-500" />
                      <SourceRow label="Direto" value="650" percentage={10} color="bg-zinc-500" />
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Performance por UTM</h3>
                    <div className="space-y-4">
                      <SourceRow label="utm_source=facebook" value="2.8k" percentage={45} color="bg-emerald-500" />
                      <SourceRow label="utm_source=instagram" value="1.4k" percentage={20} color="bg-emerald-500" />
                      <SourceRow label="utm_source=youtube" value="820" percentage={15} color="bg-emerald-500" />
                    </div>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="devices" className="m-0 focus-visible:ring-0">
               <div className="max-w-md mx-auto py-12">
                  <div className="flex justify-around items-end gap-12 text-center">
                    <DeviceGauge label="Mobile" percentage={82} icon={Smartphone} />
                    <DeviceGauge label="Desktop" percentage={15} icon={Globe} />
                    <DeviceGauge label="Tablet" percentage={3} icon={Smartphone} />
                  </div>
               </div>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

interface HeaderMetricProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
}

function HeaderMetric({ label, value, icon: Icon, color = "text-zinc-100" }: HeaderMetricProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 uppercase font-bold tracking-[0.15em]">
        <Icon size={12} />
        {label}
      </div>
      <p className={cn("text-xl font-mono font-bold mt-0.5", color)}>{value}</p>
    </div>
  );
}

interface TabTriggerProps {
  value: string;
  icon: React.ElementType;
  label: string;
}

function TabTrigger({ value, icon: Icon, label }: TabTriggerProps) {
  return (
    <TabsTrigger 
      value={value} 
      className="data-[state=active]:bg-transparent data-[state=active]:text-primary-500 data-[state=active]:border-b-2 border-primary-500 rounded-none px-0 h-14 text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 group outline-none"
    >
      <Icon size={14} className="text-zinc-500 group-data-[state=active]:text-primary-500" />
      {label}
    </TabsTrigger>
  );
}

interface SourceRowProps {
  label: string;
  value: string | number;
  percentage: number;
  color: string;
}

function SourceRow({ label, value, percentage, color }: SourceRowProps) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-zinc-400">{label}</span>
                <span className="text-zinc-100">{value} ({percentage}%)</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}

interface DeviceGaugeProps {
  label: string;
  percentage: number;
  icon: React.ElementType;
}

function DeviceGauge({ label, percentage, icon: Icon }: DeviceGaugeProps) {
  return (
    <div className="flex flex-col items-center gap-3 group">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-zinc-800" />
          <circle 
            cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" 
            fill="transparent" className="text-primary-500 shadow-[0_0_10px_rgba(121,205,37,0.5)]" 
            strokeDasharray={276} 
            strokeDashoffset={276 - (276 * percentage) / 100} 
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-3 rounded-full bg-white/5 text-zinc-100">
            <Icon size={24} />
          </div>
        </div>
      </div>
      <div>
        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{label}</p>
        <p className="text-lg font-mono font-bold text-white mt-0.5">{percentage}%</p>
      </div>
    </div>
  )
}
