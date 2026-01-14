"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter } from "lucide-react";
import { useState } from "react";

interface ProjectFiltersProps {
  onFilterChange: (filters: { priority?: string }) => void;
}

export function ProjectFilters({ onFilterChange }: ProjectFiltersProps) {
  const [priority, setPriority] = useState<string | null>(null);

  const handleApply = () => {
    onFilterChange({
        priority: priority || undefined
    });
  };

  const clearFilters = () => {
      setPriority(null);
      onFilterChange({});
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-white/10 text-zinc-400 hover:text-white hover:bg-white/5">
            <Filter size={14} className="mr-2" />
            Filtros Avançados
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-zinc-950 border-white/10 p-4" align="end">
        <div className="space-y-4">
          <h4 className="font-medium text-white">Filtrar Tarefas</h4>
          
          <div className="space-y-2">
            <Label className="text-zinc-400">Prioridade</Label>
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
              <Button size="sm" onClick={handleApply} className="bg-primary-500 text-black hover:bg-primary-600">
                  Aplicar Filtros
              </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
