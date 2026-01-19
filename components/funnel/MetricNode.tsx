"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricNodeData {
  label: string;
  type: 'traffic' | 'page' | 'sale';
  value: number;
  count: number;
  conversionRate: number;
  roi: number;
}

export const MetricNode = memo(({ data, selected }: { data: MetricNodeData; selected: boolean }) => {
  const isTraffic = data.type === 'traffic';
  
  return (
    <div className="relative group">
      <Handle type="target" position={Position.Left} className="bg-zinc-500! w-3! h-3! -left-2!" />
      
      <Card 
        className={cn(
          "w-[280px] border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl transition-all duration-300",
          selected ? "border-primary-500 ring-2 ring-primary-500/20" : "hover:border-zinc-700",
          "matrix-mode:border-green-500" 
        )}
      >
        {/* Header Colorido */}
        <div className={cn(
          "h-1.5 w-full rounded-t-xl",
          isTraffic ? "bg-blue-500" : "bg-primary-500"
        )} />

        <div className="p-4 space-y-4">
            {/* Título e Ícone */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "p-2 rounded-lg bg-zinc-900/50 border border-white/5",
                        isTraffic ? "text-blue-400" : "text-primary-500"
                    )}>
                        {isTraffic ? <MousePointerClick size={16} /> : <DollarSign size={16} />}
                    </div>
                    <span className="font-bold text-zinc-100 text-sm">{data.label}</span>
                </div>
                {isTraffic && (
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                        Meta Ads
                    </Badge>
                )}
            </div>

            {/* Grid de Métricas */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">
                        {isTraffic ? 'Gasto' : 'Faturamento'}
                    </p>
                    <p className="text-sm font-mono font-bold text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.value)}
                    </p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">
                        {isTraffic ? 'Cliques' : 'Vendas'}
                    </p>
                    <p className="text-sm font-mono font-bold text-white">
                        {data.count}
                    </p>
                </div>
            </div>

            {/* Rodapé (Mini gráfico ou info extra) */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-zinc-500 flex items-center gap-1">
                    <MetricTrendingUp size={12} /> Conv. {data.conversionRate}%
                </span>
                <span className={cn(
                    "font-bold",
                    data.roi > 0 ? "text-emerald-500" : "text-red-500"
                )}>
                    {data.roi > 0 ? '+' : ''}{data.roi}% ROI
                </span>
            </div>
        </div>
      </Card>

      <Handle type="source" position={Position.Right} className="bg-zinc-500! w-3! h-3! -right-2!" />
    </div>
  );
});

// Avoid naming collision if TrendingUp is used elsewhere or just for clarity
const MetricTrendingUp = TrendingUp;

MetricNode.displayName = "MetricNode";
