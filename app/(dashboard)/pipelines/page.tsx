"use client";

import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { Plus, Search, Filter, SlidersHorizontal, Download } from "lucide-react";
import { useModal } from "@/contexts/modal-context";
import { NewDealModal } from "@/components/modals/new-deal-modal";
import { PipelineStepsModal } from "@/components/modals/pipeline-steps-modal";
import { PipelineFilters } from "@/components/pipeline/pipeline-filters";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";

export default function PipelinesPage() {
  const { openModal } = useModal();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{ minValues?: number; priority?: string }>({});
  const [showMyDeals, setShowMyDeals] = useState(false);

  const handleExport = async () => {
    try {
        const { data: deals } = await supabase.from('deals').select('*');
        if (!deals || deals.length === 0) {
            toast.error("Sem dados para exportar.");
            return;
        }

        const headers = ["ID", "Título", "Cliente", "Valor", "Estágio", "Probabilidade", "Prioridade"];
        const csvContent = [
            headers.join(","),
            ...deals.map(deal => [
                deal.id,
                `"${deal.title}"`,
                `"${deal.client_name}"`,
                deal.value,
                deal.stage,
                `${deal.probability || 0}%`,
                deal.priority || 'N/A'
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `deals_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Exportação concluída com sucesso!");
    } catch (error) {
        console.error("Export error:", error);
        toast.error("Erro ao exportar dados.");
    }
  };

  const handleStepsConfig = () => {
    openModal(<PipelineStepsModal />);
  };

  const handleFilterChange = (newFilters: { minValues?: number; priority?: string }) => {
      setFilters(newFilters);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipeline de Vendas</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas oportunidades e funil de conversão.</p>
        </div>
        
        <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" onClick={handleStepsConfig}>
                <SlidersHorizontal size={16} className="mr-2" />
                Etapas
             </Button>
             <Button variant="outline" size="sm" onClick={handleExport}>
                <Download size={16} className="mr-2" />
                Exportar
             </Button>
             <Button 
                onClick={() => openModal(<NewDealModal />)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
             >
                <Plus size={18} className="mr-2" strokeWidth={3} />
                Nova Oportunidade
            </Button>
        </div>
      </div>

      {/* Filters Toolbar com Shadcn */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-card border border-border/50 p-2 rounded-lg shadow-sm">
          <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                  placeholder="Buscar por cliente, título ou valor..." 
                  className="pl-9 border-0 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
          
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          
          <div className="flex gap-2 w-full sm:w-auto">
               <Button 
                    variant={showMyDeals ? "secondary" : "ghost"} 
                    size="sm" 
                    className={showMyDeals ? "bg-primary-500/10 text-primary-500 hover:bg-primary-500/20" : "text-muted-foreground hover:text-foreground"}
                    onClick={() => setShowMyDeals(!showMyDeals)}
               >
                   Meus Deals
               </Button>
               <PipelineFilters onFilterChange={handleFilterChange} />
          </div>
      </div>

      {/* Board Area */}
      <div className="flex-1 min-h-0 overflow-hidden rounded-xl bg-accent/20 border border-border/30 relative">
         <div className="absolute inset-0 p-4 overflow-x-auto overflow-y-hidden">
             <PipelineBoard 
                searchQuery={searchQuery} 
                filters={filters}
                onlyMyDeals={showMyDeals}
             />
         </div>
      </div>
    </div>
  );
}
