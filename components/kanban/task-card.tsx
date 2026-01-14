"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/kanban";
import { cn } from "@/lib/utils";
import { Calendar, MoreHorizontal, Copy, Trash2, Edit2, Link as LinkIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

import { ptBR } from "date-fns/locale";

interface Props {
  task: Task;
  onClick?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export function TaskCard({ task, onClick, onDuplicate, onDelete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "Task", task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCopyLink = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Em produção, isso seria uma URL real para o modal da tarefa
      const url = `${window.location.origin}/tarefas?taskId=${task.id}`;
      navigator.clipboard.writeText(url);
      alert("Link copiado!");
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 bg-zinc-800/50 border border-pink-500/50 h-[100px] rounded-xl"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "group bg-card border border-border p-3 rounded-xl hover:border-border/50 transition-all cursor-grab active:cursor-grabbing shadow-sm relative",
        "hover:shadow-lg hover:shadow-black/50"
      )}

    >
      {/* Menu de Ações (Absolute para não interferir no layout) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 p-0 hover:bg-white/10 rounded text-muted-foreground hover:text-white" onPointerDown={(e) => e.stopPropagation()}>
                      <MoreHorizontal size={14} />
                  </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 w-40">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
                      <Edit2 className="mr-2 h-3 w-3" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate?.(); }}>
                      <Copy className="mr-2 h-3 w-3" /> Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyLink}>
                      <LinkIcon className="mr-2 h-3 w-3" /> Copiar Link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                    className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                  >
                      <Trash2 className="mr-2 h-3 w-3" /> Excluir
                  </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-2 pr-6">
        {task.tags?.slice(0, 2).map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10">
                {tag}
            </Badge>
        ))}
        {task.priority === 'high' && (
             <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5 bg-red-500/10 text-red-500 border-red-500/20">
                Urgente
             </Badge>
        )}
      </div>

      <h4 className="text-sm font-medium text-zinc-200 line-clamp-2 mb-3 leading-snug">
        {task.title}
      </h4>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
           {task.due_date && (
               <div className={cn("flex items-center gap-1", new Date(task.due_date) < new Date() ? "text-red-400" : "")}>
                   <Calendar size={12} />
                   <span>{format(new Date(task.due_date), "dd MMM", { locale: ptBR })}</span>
               </div>
           )}
        </div>

        <div className="flex items-center -space-x-2">
            {task.assignee ? (
                <Avatar className="w-6 h-6 border-2 border-zinc-950">
                    <AvatarImage src={task.assignee.avatar_url} />
                    <AvatarFallback className="text-[9px] bg-pink-600 text-white">
                        {task.assignee.full_name?.substring(0,2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            ) : (
                <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center">
                    <span className="text-[9px] text-zinc-500">?</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
