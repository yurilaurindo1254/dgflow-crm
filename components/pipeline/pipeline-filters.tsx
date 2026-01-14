"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter } from "lucide-react";
import { useState } from "react";

interface PipelineFiltersProps {
  onFilterChange: (filters: { minValues?: number; priority?: string }) => void;
}

export function PipelineFilters({ onFilterChange }: PipelineFiltersProps) {
  const [minValue, setMinValue] = useState("");
  const [priority, setPriority] = useState<string | null>(null);

  const handleApply = () => {
    onFilterChange({
        minValues: minValue ? parseFloat(minValue) : undefined,
        priority: priority || undefined
    });
  };

  const clearFilters = () => {
      setMinValue("");
      setPriority(null);
      onFilterChange({});
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm">
            <Filter size={14} className="mr-2" />
            Filtros Avançados
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-zinc-950 border-white/10 p-4" align="end">
        <div className="space-y-4">
          <h4 className="font-medium text-white">Filtrar Oportunidades</h4>
          
          <div className="space-y-2">
            <Label>Valor Mínimo (R$)</Label>
            <Input 
                type="number" 
                placeholder="Ex: 1000" 
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                className="bg-zinc-900 border-white/10"
            />
          </div>

          <div className="space-y-2">
            <Label>Prioridade</Label>
            <div className="flex gap-2">
                {['low', 'medium', 'high'].map(p => (
                    <button
                        key={p}
                        onClick={() => setPriority(priority === p ? null : p)}
                        className={`px-3 py-1 rounded text-xs border capitalize transition-all ${
                            priority === p 
                            ? 'bg-primary-500/20 border-primary-500 text-primary-500' 
                            : 'bg-zinc-900 border-white/10 text-zinc-400 hover:bg-zinc-800'
                        }`}
                    >
                        {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Alta'}
                    </button>
                ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-zinc-500 hover:text-white">
                  Limpar
              </Button>
              <Button size="sm" onClick={handleApply} className="bg-primary text-black hover:bg-primary/90">
                  Aplicar Filtros
              </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
