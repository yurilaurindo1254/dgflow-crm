"use client";

import { useState } from "react";
import { 
  Search, 
  Calendar, 
  LayoutTemplate,
  Filter
} from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewTaskModal } from "@/components/modals/new-task-modal";
import { KanbanBoard } from "@/components/kanban/board";
import { useModal } from "@/contexts/modal-context";
import { cn } from "@/lib/utils";



export default function TasksPage() {
  const { openModal } = useModal();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMyTasksOnly, setShowMyTasksOnly] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Kanban de Projetos</h2>
          <p className="text-zinc-400">Arraste e organize suas tarefas</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 bg-background border-border hover:bg-zinc-800 transition-colors">
            <LayoutTemplate size={16} />
            Colunas
          </Button>
          
          <Button 
            onClick={() => openModal(<NewTaskModal />)}
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold shadow-lg shadow-pink-500/20"
          >
            + Nova Tarefa
          </Button>
        </div>

      </div>

      {/* Toolbar de Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 bg-zinc-900/50 p-2 rounded-xl border border-white/5">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Buscar por título ou tag..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border focus-visible:ring-pink-500/50"
          />
        </div>

        
        <div className="hidden sm:block h-6 w-px bg-white/10 mx-2"></div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className={cn("text-muted-foreground hover:text-white", showMyTasksOnly && "text-pink-500 bg-pink-500/10")}>
                <Filter size={16} className="mr-2" />
                Filtros
                {showMyTasksOnly && <span className="ml-2 w-2 h-2 rounded-full bg-pink-500" />}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-4 bg-zinc-950 border-zinc-800">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="my-tasks" 
                  checked={showMyTasksOnly}
                  onCheckedChange={(checked) => setShowMyTasksOnly(checked as boolean)}
                />
                <Label htmlFor="my-tasks" className="text-zinc-200 cursor-pointer">
                  Minhas Tarefas
                </Label>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white cursor-not-allowed opacity-50" title="Em breve">
            <Calendar size={16} />
            Data
          </Button>
        </div>

      </div>

      {/* Área do Board (Passando o filtro) */}
      <div className="flex-1 min-h-0 overflow-hidden">
         <KanbanBoard searchQuery={searchQuery} showMyTasksOnly={showMyTasksOnly} />
      </div>
    </div>
  );
}
