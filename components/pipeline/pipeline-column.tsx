"use client";

import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Deal, DealCard } from "./deal-card";
import { useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ColumnProps {
  id: string;
  title: string;
  deals: Deal[];
}

export function PipelineColumn({ id, title, deals }: ColumnProps) {
  const dealIds = useMemo(() => deals.map((d) => d.id), [deals]);
  
  // Cálculo de totais
  const totalValue = deals.reduce((acc, deal) => acc + deal.value, 0);
  const formattedTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalValue);

  const { isOver, setNodeRef } = useSortable({
    id: id,
    data: { type: "Column", id },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col h-full w-[320px] shrink-0 rounded-xl transition-all duration-300",
        isOver ? "bg-accent/50 ring-1 ring-primary/30" : "bg-transparent"
      )}
    >
      {/* Header Sticky Glassmorphism */}
      <div className="flex flex-col gap-3 p-4 mb-2 bg-background/60 backdrop-blur-xl rounded-xl border border-border/50 sticky top-0 z-10 shadow-sm">
         <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm tracking-tight">{title}</h3>
            <Badge variant="secondary" className="text-[10px] px-1.5 h-5 min-w-[20px] justify-center">
                {deals.length}
            </Badge>
         </div>
         
         {/* Resumo Financeiro da Coluna */}
         <div className="flex items-end justify-between">
             <span className="text-xs text-muted-foreground font-medium">Previsão</span>
             <span className={cn(
                 "text-sm font-bold font-mono",
                 id === 'won' ? "text-green-500" : "text-foreground"
             )}>
                 {formattedTotal}
             </span>
         </div>
         
         {/* Barra visual de volume */}
         <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
             <div 
                className={cn("h-full rounded-full opacity-80", id === 'won' ? "bg-green-500" : "bg-primary")} 
                style={{ width: '40%' }} // Lógica de % da meta viria aqui
             /> 
         </div>
      </div>

      {/* Lista de Deals */}
      <div className="flex-1 flex flex-col gap-3 p-1 overflow-y-auto custom-scrollbar">
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>
        
        {/* Botão de Adição Rápida shadcn style */}
        <Button 
            variant="outline" 
            className="w-full border-dashed border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-accent/50 h-12"
        >
             <Plus size={16} className="mr-2" />
             Novo Deal
        </Button>
      </div>
    </div>
  );
}
