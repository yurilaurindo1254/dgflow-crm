"use client";

import { KanbanBoard } from "@/components/kanban/board";
import { Search, SlidersHorizontal } from "lucide-react";
import { useModal } from "@/contexts/modal-context";
import { NewTaskModal } from "@/components/modals/new-task-modal";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProjectFilters } from "@/components/kanban/project-filters";
import { Separator } from "@/components/ui/separator";

export default function ProjectsPage() {
  const { openModal } = useModal();
  const [searchQuery, setSearchQuery] = useState("");
  const [priority, setPriority] = useState("");
  const [showMyTasks, setShowMyTasks] = useState(false);

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kanban de Projetos</h2>
          <p className="text-zinc-400">Arraste e organize suas tarefas e entregas.</p>
        </div>
        
        <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" className="border-white/10 text-zinc-400">
                <SlidersHorizontal size={16} className="mr-2" />
                Colunas
             </Button>
             <Button 
                onClick={() => openModal(<NewTaskModal />)}
                className="bg-primary-500 hover:bg-primary-600 text-black font-bold shadow-lg shadow-primary-500/20"
             >
                + Nova Tarefa
            </Button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-zinc-900/50 border border-white/5 p-2 rounded-xl">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <Input 
                placeholder="Buscar tarefas, clientes ou tags..." 
                className="pl-9 border-0 bg-transparent focus-visible:ring-0 placeholder:text-zinc-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        
        <Separator orientation="vertical" className="h-6 hidden sm:block bg-white/10" />
        
        <div className="flex gap-2 w-full sm:w-auto">
             <Button 
                  variant={showMyTasks ? "secondary" : "ghost"} 
                  size="sm" 
                  className={showMyTasks ? "bg-primary-500/10 text-primary-500 hover:bg-primary-500/20" : "text-zinc-400 hover:text-white"}
                  onClick={() => setShowMyTasks(!showMyTasks)}
             >
                 Minhas Tarefas
             </Button>
             <ProjectFilters onFilterChange={(f) => setPriority(f.priority || "")} />
        </div>
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 min-h-0 bg-zinc-950/20 rounded-xl border border-white/5 p-4 overflow-hidden">
          <KanbanBoard 
            searchQuery={searchQuery}
            showMyTasksOnly={showMyTasks}
            priority={priority}
          />
      </div>
    </div>
  );
}
