"use client";

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  MousePointer2, 
  Globe, 
  ShoppingCart, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { NodeData } from './NodeDetailsSheet';

const MOCK_SPARKLINE = [
  { v: 10 }, { v: 15 }, { v: 8 }, { v: 12 }, { v: 20 }, { v: 18 }, { v: 25 }
];

const NODE_TYPES = {
  ad_source: { icon: Globe, title: 'Tráfego', color: 'text-blue-500' },
  page: { icon: BarChart3, title: 'Página', color: 'text-purple-500' },
  checkout: { icon: ShoppingCart, title: 'Checkout', color: 'text-orange-500' },
  purchase: { icon: CheckCircle2, title: 'Venda', color: 'text-emerald-500' },
};

export const MetricNode = memo(({ data, selected }: { data: NodeData; selected: boolean }) => {
  const nodeInfo = NODE_TYPES[data.type as keyof typeof NODE_TYPES] || NODE_TYPES.page;
  const Icon = nodeInfo.icon;

  return (
    <div className="group relative">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-zinc-800 border-zinc-700" />
      
      <Card className={cn(
        "w-64 bg-zinc-950/80 backdrop-blur-xl border-white/5 transition-all duration-300 shadow-2xl",
        selected ? "border-primary-500/50 ring-2 ring-primary-500/20" : "hover:border-white/10"
      )}>
        <CardHeader className="p-4 pb-2 border-b border-white/5 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors", nodeInfo.color)}>
              <Icon size={18} />
            </div>
            <CardTitle className="text-sm font-bold text-white tracking-tight">
              {data.label || nodeInfo.title}
            </CardTitle>
          </div>
          <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </CardHeader>
        
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {data.type === 'ad_source' && (
              <>
                <MetricItem label="Gasto" value={`R$ ${data.spend || '0'}`} />
                <MetricItem label="Cliques" value={data.clicks || '0'} />
              </>
            )}
            {data.type === 'page' && (
              <>
                <MetricItem label="Visitas" value={data.visits || '0'} />
                <MetricItem label="Scroll" value={`${data.scroll || '0'}%`} />
              </>
            )}
            {data.type === 'checkout' && (
              <>
                <MetricItem label="Iniciados" value={data.checkouts || '0'} />
                <MetricItem label="Abandono" value={`${data.abandonment || '0'}%`} />
              </>
            )}
            {data.type === 'purchase' && (
              <>
                <MetricItem label="Vendas" value={data.sales || '0'} />
                <MetricItem label="Ticket" value={`R$ ${data.aov || '0'}`} />
              </>
            )}
          </div>

          <div className="h-10 w-full opacity-50 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.sparkline || MOCK_SPARKLINE}>
                <Line 
                  type="monotone" 
                  dataKey="v" 
                  stroke={selected ? "#79cd25" : "#52525b"} 
                  strokeWidth={2} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-zinc-800 border-zinc-700" />
    </div>
  );
});

function MetricItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{label}</p>
      <p className="text-sm font-bold text-white mt-0.5">{value}</p>
    </div>
  );
}

MetricNode.displayName = 'MetricNode';
