"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageSquare, AlertCircle } from "lucide-react";


interface ProjectTask {
  id: string;
  title: string;
  column_id: string;
  priority: string;
  due_date?: string;
}

interface ProjectColumn {
  id: string;
  title: string;
  color: string;
}

export default function ProjectsPage() {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [columns, setColumns] = useState<ProjectColumn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('client_id')
        .eq('id', user.id)
        .single();

      if (profile?.client_id) {
        const { data: tsk } = await supabase
          .from('tasks')
          .select('*')
          .eq('client_id', profile.client_id)
          .order('position');
        
        const { data: cols } = await supabase
          .from('project_columns')
          .select('*')
          .order('order_index');

        setTasks((tsk as ProjectTask[]) || []);
        setColumns((cols as ProjectColumn[]) || []);
      }
      setLoading(false);
    }
    loadTasks();
  }, []);

  if (loading) return <div className="p-8 text-zinc-500 animate-pulse">Carregando projetos...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Acompanhamento de Projetos</h1>
        <p className="text-zinc-500 mt-1">Status em tempo real das entregas da agência.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {columns.map((column) => {
          const colTasks = tasks.filter(t => t.column_id === column.id);
          if (colTasks.length === 0) return null;

          return (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center gap-2 mb-4 px-1">
                <div className="size-2 rounded-full" style={{ backgroundColor: column.color }} />
                <h3 className="font-semibold text-zinc-300 uppercase text-xs tracking-widest">{column.title}</h3>
                <Badge variant="secondary" className="bg-white/5 text-zinc-500 border-none px-1.5 py-0 h-4 text-[10px]">
                  {colTasks.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {colTasks.map((task) => (
                  <Card key={task.id} className="bg-zinc-900/50 border-white/5 hover:border-white/10 transition-all group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                          {task.title}
                        </h4>
                        {task.priority === 'high' && (
                          <AlertCircle size={14} className="text-red-500 shrink-0" />
                        )}
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                             <MessageSquare size={12} />
                             <span>Ver detalhes</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                           <Clock size={12} />
                           <span>Entregar em: {task.due_date ? new Date(task.due_date).toLocaleDateString() : '--/--'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {tasks.length === 0 && (
        <div className="bg-zinc-900/30 border border-dashed border-white/5 rounded-2xl p-12 text-center">
          <p className="text-zinc-600 italic">Nenhuma tarefa encontrada para este projeto.</p>
        </div>
      )}
    </div>
  );
}

