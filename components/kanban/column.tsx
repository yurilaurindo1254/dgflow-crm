"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Column, Task } from "@/types/kanban";
import { TaskCard } from "./task-card";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface Props {
  column: Column;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDuplicate?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onAddClick?: () => void;
  onDeleteColumn?: () => void;
}

export function KanbanColumn({ column, tasks, onTaskClick, onDuplicate, onDelete, onAddClick, onDeleteColumn }: Props) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex flex-col w-80 shrink-0 h-full max-h-full">
      {/* Cabeçalho da Coluna */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
            <span className="font-semibold text-zinc-200 text-sm tracking-wide">{column.title}</span>
            <span className="bg-zinc-800 text-zinc-500 text-xs px-2 py-0.5 rounded-full border border-white/5">
                {tasks.length}
            </span>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onAddClick}
            className="h-7 w-7 p-0 hover:bg-white/10 rounded text-muted-foreground hover:text-white transition-colors"
          >
            <Plus size={16} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 p-0 hover:bg-white/10 rounded text-muted-foreground hover:text-white transition-colors"
                >
                    <MoreHorizontal size={16} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-zinc-950 border-zinc-800 text-zinc-200">
                <DropdownMenuItem onClick={onDeleteColumn} className="cursor-pointer text-red-500 hover:text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400">
                    <Trash className="mr-2 h-4 w-4" />
                    <span>Excluir Coluna</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>

      {/* Área Droppable */}
      <div 
        ref={setNodeRef}
        className={cn(
            "flex-1 bg-muted/10 rounded-xl border border-border p-2 flex flex-col gap-2 overflow-y-auto custom-scrollbar",
            "transition-colors hover:bg-muted/20"
        )}
      >

        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard 
                key={task.id} 
                task={task} 
                onClick={() => onTaskClick(task)}
                onDuplicate={() => onDuplicate?.(task)}
                onDelete={() => onDelete?.(task.id)}
            />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
            <div className="h-full flex items-center justify-center text-zinc-600 text-xs italic border-2 border-dashed border-zinc-800/50 rounded-lg m-1">
                Arraste tarefas aqui
            </div>
        )}
      </div>
    </div>
  );
}
