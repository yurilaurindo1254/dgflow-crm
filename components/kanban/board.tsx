"use client";

import { useEffect, useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { Column, Task } from "@/types/kanban";
import { supabase } from "@/lib/supabase";
import { KanbanColumn } from "./column";
import { TaskCard } from "./task-card";
import { TaskModal } from "./task-modal";
import { Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    searchQuery?: string;
    showMyTasksOnly?: boolean;
    priority?: string;
}

export function KanbanBoard({ searchQuery = "", showMyTasksOnly = false, priority = "" }: Props) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Configuração dos Sensores de DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Carregar Dados e Usuário
  useEffect(() => {
    async function fetchData() {
       setLoading(true);
       
       const { data: { user } } = await supabase.auth.getUser();
       if (user) setCurrentUserId(user.id);

       const { data: cols } = await supabase.from('project_columns').select('*').order('order_index');
       const { data: tsk } = await supabase.from('tasks').select('*, assignee:profiles(full_name, avatar_url), client:clients(name)').order('index_position');
       
       if (cols) setColumns(cols);
       if (tsk) setTasks(tsk);
       setLoading(false);
    }
    fetchData();
  }, []);

  // Filtragem local
  const filteredTasks = useMemo(() => {
      let result = tasks;

      // Filtro de Texto
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        result = result.filter(t => 
            t.title.toLowerCase().includes(lowerQuery) || 
            t.client?.name?.toLowerCase().includes(lowerQuery) ||
            t.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
        );
      }

      // Filtro de "Minhas Tarefas"
      if (showMyTasksOnly && currentUserId) {
        result = result.filter(t => t.assignee_id === currentUserId);
      }

      // Filtro de Prioridade
      if (priority) {
          result = result.filter(t => t.priority.toLowerCase() === priority.toLowerCase());
      }

      return result;

  }, [tasks, searchQuery, showMyTasksOnly, currentUserId, priority]);

  // --- Handlers de Ação ---

  const handleDuplicateTask = async (task: Task) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _, created_at: __, ...rest } = task;
      const newTask = {
          ...rest,
          title: `${task.title} (Cópia)`,
          index_position: tasks.filter(t => t.column_id === task.column_id).length
      };

      const { data } = await supabase.from('tasks').insert(newTask).select('*, assignee:profiles(full_name, avatar_url), client:clients(name)').single();
      
      if (data) {
          setTasks([...tasks, data]);
          alert("Tarefa duplicada com sucesso");
      } else {
          alert("Erro ao duplicar tarefa");
      }
  };

  const handleDeleteTask = async (taskId: string) => {
      if(!confirm("Tem certeza que deseja excluir esta tarefa?")) return;

      const previousTasks = [...tasks];
      setTasks(tasks.filter(t => t.id !== taskId)); // Otimista

      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) {
          setTasks(previousTasks); // Rollback
          alert("Erro ao excluir tarefa");
      } else {
          alert("Tarefa excluída");
      }
  };

  // --- Handlers de Coluna (Novo) ---

  const handleAddColumn = async () => {
      const title = prompt("Nome da nova coluna:");
      if (!title) return;

      const newColumn = {
          title,
          color: "#555555",
          order_index: columns.length
      };

      const { data, error } = await supabase.from('project_columns').insert(newColumn).select().single();
      
      if (data) {
          setColumns([...columns, data]);
      } else {
          alert("Erro ao criar coluna");
          console.error(error);
      }
  };

  const handleDeleteColumn = async (columnId: string) => {
      if (!confirm("Tem certeza que deseja excluir esta coluna? Todas as tarefas nela serão apagadas!")) return;

      const { error } = await supabase.from('project_columns').delete().eq('id', columnId);
      
      if (!error) {
          setColumns(columns.filter(c => c.id !== columnId));
          setTasks(tasks.filter(t => t.column_id !== columnId)); // Remove tarefas locais também
      } else {
          alert("Erro ao excluir coluna");
          console.error(error);
      }
  };

  const handleQuickAddTask = (columnId: string) => {
      // Abre o modal de tarefa com um objeto vazio preenchido com a coluna atual
      setEditingTask({
          id: "", // ID vazio indica criação
          column_id: columnId,
          title: "",
          priority: "medium",
          index_position: tasks.filter(t => t.column_id === columnId).length,
          tags: []
      } as Task);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskIndex = tasks.findIndex(t => t.id === activeId);
    if (activeTaskIndex === -1) return;
    
    const activeTask = tasks[activeTaskIndex];
    const isOverColumn = columns.some(c => c.id === overId);
    const isOverTask = tasks.some(t => t.id === overId);

    // Cenário 1: Soltou numa Coluna (vazia ou na área dela)
    if (isOverColumn) {
        const newColumnId = overId;
        if (activeTask.column_id !== newColumnId) {
             const updatedTasks = [...tasks];
             updatedTasks[activeTaskIndex] = { ...activeTask, column_id: newColumnId };
             setTasks(updatedTasks);
             await supabase.from('tasks').update({ column_id: newColumnId }).eq('id', activeId);
        }
    } 
    // Cenário 2: Soltou sobre outra Tarefa (Reordenar)
    else if (isOverTask) {
         const overTaskIndex = tasks.findIndex(t => t.id === overId);
         const overTask = tasks[overTaskIndex];
         
         if (activeId !== overId) {
             let newTasks = [...tasks];
             const activeClone = { ...activeTask }; 

             // Mudança de coluna via drop na tarefa
             if (activeClone.column_id !== overTask.column_id) {
                 activeClone.column_id = overTask.column_id;
                 const activeIndexInNew = newTasks.findIndex(t => t.id === activeId);
                 if (activeIndexInNew !== -1) newTasks[activeIndexInNew] = activeClone;
             }
             
             newTasks = arrayMove(newTasks, activeTaskIndex, overTaskIndex);
             setTasks(newTasks);
             
             // Atualizar no banco (apenas coluna por enquanto, ordem requer lógica complexa de update em lote)
             if (activeTask.column_id !== overTask.column_id) {
                await supabase.from('tasks').update({ column_id: overTask.column_id }).eq('id', activeId);
             }
         }
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-pink-500 w-8 h-8"/></div>;

  return (
    <div className="flex flex-col h-full">
        <DndContext 
            sensors={sensors} 
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
        <div className="flex h-full gap-4 overflow-x-auto pb-4 items-start px-1">
            {columns.map(col => (
                <KanbanColumn 
                    key={col.id} 
                    column={col} 
                    tasks={filteredTasks.filter(t => t.column_id === col.id)} 
                    onTaskClick={(task) => setEditingTask(task)}
                    onDuplicate={handleDuplicateTask}
                    onDelete={handleDeleteTask}
                    onAddClick={() => handleQuickAddTask(col.id)}
                    onDeleteColumn={() => handleDeleteColumn(col.id)}
                />
            ))}
            
            {/* Botão Nova Coluna */}
            <div className="shrink-0 w-80 h-10 border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center hover:border-zinc-700 transition-colors">
                <Button variant="ghost" className="w-full h-full text-zinc-500 hover:text-zinc-300" onClick={handleAddColumn}>
                    <Plus className="mr-2 h-4 w-4" /> Nova Coluna
                </Button>
            </div>
        </div>

        {createPortal(
            <DragOverlay>
                {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>,
            document.body
        )}
        
        {editingTask && (
            <TaskModal 
                task={editingTask} 
                columns={columns}
                onClose={() => setEditingTask(null)} 
                onUpdate={(updated: Task) => {
                    const exists = tasks.find(t => t.id === updated.id);
                    if (exists) {
                        setTasks(tasks.map(t => t.id === updated.id ? updated : t));
                    } else {
                        setTasks([...tasks, updated]);
                    }
                    setEditingTask(updated); // Mantém aberto, ou pode fechar se preferir
                }}
            />
        )}
        </DndContext>
    </div>
  );
}
