"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Task, Column, Subtask, Profile, ActivityLog, TaskComment } from "@/types/kanban";
import { X, Calendar as CalendarIcon, User, Tag, Clock, CheckCircle2, MessageSquare, Activity, ChevronDown, Check, Trash2, Plus, Link as LinkIcon, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { RichTextEditor } from "./rich-text-editor";
import { 
  Dialog,
  DialogContent, 
  DialogOverlay, 
  DialogPortal,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  task: Task;
  columns?: Column[];
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
}

export function TaskModal({ task, columns = [], onClose, onUpdate }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [saving, setSaving] = useState(false);

  // Input para nova subtarefa
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // Comentários e Entrega
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [deliveryLink, setDeliveryLink] = useState(task.delivery_link || "");

  // Carregar Dados Relacionados
  useEffect(() => {
      async function loadData() {
          // Carregar Atividades
          const { data: act } = await supabase
            .from('task_activities')
            .select('*')
            .eq('task_id', task.id)
            .order('created_at', { ascending: false });
          if (act) setActivities(act);

          // Carregar Subtarefas
          const { data: sub } = await supabase
            .from('subtasks')
            .select('*')
            .eq('task_id', task.id)
            .order('created_at');
          if (sub) setSubtasks(sub);
          
          // Carregar Usuários para o Select de Responsável
          const { data: prof } = await supabase.from('profiles').select('*');
          if (prof) setProfiles(prof);

          // Carregar Comentários
          const { data: comm } = await supabase
            .from('task_comments')
            .select('*')
            .eq('task_id', task.id)
            .order('created_at', { ascending: true });
          
          if (comm) {
             setComments(comm);
          }
      }
      loadData();
  }, [task.id]);

  // Função genérica de salvar (Auto-Save)
  const saveChanges = async (updates: Partial<Task>) => {
      setSaving(true);
      const { error } = await supabase.from('tasks').update(updates).eq('id', task.id);
      
      if (!error) {
          // Se mudou o responsável, precisamos atualizar o objeto completo localmente para a UI refletir (avatar, nome)
          const enrichedUpdates: Partial<Task> & { assignee?: Partial<Profile> } = { ...updates };
          if (updates.assignee_id && profiles.length > 0) {
              const assignee = profiles.find(p => p.id === updates.assignee_id);
              if (assignee) enrichedUpdates.assignee = assignee;
          }

          onUpdate({ ...task, ...enrichedUpdates } as Task);
      }
      setSaving(false);
  };

  // Gerenciamento de Subtarefas
  const addSubtask = async () => {
      if (!newSubtaskTitle.trim()) return;
      
      // Cria a subtarefa no banco
      const { data } = await supabase.from('subtasks').insert({
          task_id: task.id,
          title: newSubtaskTitle,
          completed: false
      }).select().single();

      if (data) {
          setSubtasks([...subtasks, data]);
          setNewSubtaskTitle("");
      }
  };

  const toggleSubtask = async (id: string, completed: boolean) => {
      // Otimista
      setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed } : s)); 
      await supabase.from('subtasks').update({ completed }).eq('id', id);
  };

  const deleteSubtask = async (id: string) => {
      setSubtasks(subtasks.filter(s => s.id !== id));
      await supabase.from('subtasks').delete().eq('id', id);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase.from('task_comments').insert({
            task_id: task.id,
            user_id: user.id,
            content: newComment
        }).select().single();

        if (data) {
            setComments([...comments, data]);
            setNewComment("");
        }
    } catch (error) {
        console.error("Erro ao enviar comentário:", error);
    }
  };

  const currentColumn = columns.find(c => c.id === task.column_id);

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-all durationbg-dark-900" />
        <DialogContent showCloseButton={false} className="fixed left-[50%] top-[50%] z-50 w-full sm:max-w-5xl translate-x-[-50%] translate-y-[-50%] bg-card border border-border rounded-xl shadow-2xl p-0 h-[85vh] flex flex-col overflow-hidden outline-none transition-all duration-200">
            <DialogTitle className="sr-only">Detalhes da Tarefa</DialogTitle>

            
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-zinc-900/50">
                <div className="flex items-center gap-3 flex-1">
                    <div className="px-2 py-0.5 rounded text-xs font-bold bg-white/5 text-zinc-400 border border-white/5 uppercase tracking-wider">
                        {/* ID Visual fake ou real */}
                        TAS-{task.index_position}
                    </div>
                    {/* Título Editável */}
                    <Input 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => saveChanges({ title })}
                        className="bg-transparent border-none text-lg font-semibold text-foreground focus-visible:ring-0 w-full hover:bg-muted/50 rounded px-2 transition-colors h-auto py-1"
                    />

                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    {saving && <span className="text-xs text-zinc-500 animate-pulse mr-2">Salvando...</span>}
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 hover:bg-muted/50 rounded-lg transition-colors">
                        <X size={20} />
                    </Button>
                </div>

            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Coluna Principal (Esquerda) */}
                <div className="flex-1 min-w-0 overflow-y-auto p-8 custom-scrollbar bg-zinc-950/50">
                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="bg-white/5 border border-white/5 mb-6 w-auto inline-flex rounded-lg p-1">
                            <TabsTrigger value="details" className="text-xs px-4 py-1.5 data-[state=active]:bg-zinc-800">Detalhes</TabsTrigger>
                            <TabsTrigger value="activity" className="text-xs px-4 py-1.5 data-[state=active]:bg-zinc-800">Atividade</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="details" className="space-y-8 animate-in fade-in slide-in-from-left-2">
                            {/* Editor de Descrição */}
                            <div className="group">
                                <h3 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                                    <MessageSquare size={16} /> Descrição
                                </h3>
                                <div className="min-h-[150px] rounded-lg border border-transparent group-hover:border-white/5 transition-colors">
                                    <RichTextEditor 
                                        content={description}
                                        onChange={(html) => setDescription(html)}
                                        onBlur={() => saveChanges({ description })}
                                    />
                                </div>
                            </div>

                            {/* Subtarefas */}
                            <div className="pt-6 border-t border-white/5">
                                <h3 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
                                    <CheckCircle2 size={16} /> Subtarefas
                                </h3>
                                
                                <div className="space-y-1 mb-3">
                                    {subtasks.map(sub => (
                                        <div key={sub.id} className="flex items-center gap-3 group/sub py-1">
                                            <Button 
                                                variant="outline"
                                                size="icon"
                                                onClick={() => toggleSubtask(sub.id, !sub.completed)}
                                                className={cn(
                                                    "w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 p-0",
                                                    sub.completed 
                                                        ? "bg-emerald-500 border-emerald-500 text-black hover:bg-emerald-600" 
                                                        : "border-zinc-700 hover:border-zinc-500 bg-transparent"
                                                )}
                                            >
                                                {sub.completed && <Check size={12} strokeWidth={3} />}
                                            </Button>

                                            <span className={cn(
                                                "text-sm flex-1 transition-all", 
                                                sub.completed ? "text-zinc-600 line-through decoration-zinc-700" : "text-zinc-200"
                                            )}>
                                                {sub.title}
                                            </span>
                                            <Button 
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteSubtask(sub.id)} 
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover/sub:opacity-100 transition-all p-0"
                                            >
                                                <Trash2 size={14} />
                                            </Button>

                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2 items-center mt-4">
                                    <Plus size={16} className="text-zinc-500" />
                                    <Input 
                                        value={newSubtaskTitle}
                                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                                        placeholder="Adicionar nova subtarefa..."
                                        className="flex-1 bg-transparent border-none text-sm text-foreground focus-visible:ring-0 placeholder:text-muted-foreground h-8"
                                    />
                                    {newSubtaskTitle && (
                                        <Button 
                                            size="sm" 
                                            onClick={addSubtask} 
                                            className="h-7 text-xs bg-primary/10 hover:bg-primary/20 text-primary border-none"
                                        >
                                            Adicionar
                                        </Button>
                                    )}

                                </div>
                            </div>
                        </TabsContent>


                        
                        <TabsContent value="activity">
                             <div className="space-y-6 pt-4">
                                {/* Seção de Comentários */}
                                <div className="space-y-4 mb-8">
                                    <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                        <MessageSquare size={16} /> Comentários
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        {comments.map((comment) => {
                                            const author = profiles.find(p => p.id === comment.user_id);
                                            return (
                                                <div key={comment.id} className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 shrink-0 overflow-hidden">
                                                        {author?.avatar_url 
                                                            ? <Image src={author.avatar_url} alt={author.full_name || ""} width={32} height={32} className="w-full h-full object-cover" />
                                                            : (author?.full_name?.[0] || "?")}
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-zinc-200">{author?.full_name || "Usuário"}</span>
                                                            <span className="text-xs text-zinc-500">
                                                                {format(new Date(comment.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-zinc-400 bg-white/5 p-3 rounded-lg border border-white/5">
                                                            {comment.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex gap-3">
                                        <Textarea 
                                            placeholder="Escreva um comentário..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            className="min-h-[80px] bg-zinc-950/50 border-white/10 focus-visible:ring-0 resize-none"
                                        />
                                        <Button 
                                            size="icon" 
                                            onClick={addComment}
                                            disabled={!newComment.trim()}
                                            className="h-10 w-10 shrink-0"
                                        >
                                            <Send size={16} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Seção de Atividades (Histórico) */}
                                <div>
                                    <h3 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
                                        <Activity size={16} /> Histórico
                                    </h3>
                                    <div className="space-y-6 pl-2 border-l border-white/5 ml-2">
                                        {activities.length === 0 ? (
                                            <div className="text-zinc-600 text-sm italic pl-4">Nenhuma atividade registrada além dos comentários.</div>
                                        ) : (
                                            activities.map(act => (
                                                <div key={act.id} className="relative pl-6 pb-2">
                                                    <div className="absolute -left-[25px] top-0 w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center z-10">
                                                        <Activity size={14} className="text-muted-foreground" />
                                                    </div>

                                                    <p className="text-sm">
                                                        <span className="text-zinc-300">
                                                            <span className="font-semibold text-white">Usuário</span> {act.details}
                                                        </span>
                                                        <span className="text-xs text-zinc-600 block mt-1">
                                                            {format(new Date(act.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                                                        </span>
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                             </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar de Propriedades (Direita) */}
                <div className="w-72 shrink-0 bg-zinc-900/30 border-l border-white/5 p-6 overflow-y-auto space-y-8 custom-scrollbar">
                    
                    {/* Seletor de Status */}
                    <div className="space-y-2">
                         <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</label>
                          <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button 
                                    variant="outline"
                                    className={cn(
                                        "w-full flex items-center justify-between px-3 py-2.5 h-auto rounded-lg border text-sm font-medium transition-all duration-200",
                                        "bg-background border-border hover:bg-muted/50"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: currentColumn?.color || "#555", backgroundColor: currentColumn?.color || "#555" }} />
                                        <span className="text-foreground">{currentColumn?.title || "Sem Status"}</span>
                                    </div>
                                    <ChevronDown size={14} className="text-muted-foreground" />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-64 p-1 bg-zinc-950 border-white/10 text-white shadow-xl" align="end">
                                {columns.map(col => (
                                    <div 
                                        key={col.id} 
                                        onClick={() => {
                                            saveChanges({ column_id: col.id });
                                            setStatusPopoverOpen(false);
                                        }}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer text-sm transition-colors",
                                            col.id === task.column_id ? "bg-white/10" : "hover:bg-white/5"
                                        )}
                                    >
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                                        <span className="flex-1">{col.title}</span>
                                        {col.id === task.column_id && <Check size={14} className="text-emerald-500" />}
                                    </div>
                                ))}
                            </PopoverContent>
                         </Popover>
                    </div>

                    <div className="space-y-6">
                         
                         {/* Seletor de Responsável */}
                         <div className="group">
                             <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                                 <User size={14} className="text-zinc-500" /> Responsável
                             </label>
                             <Popover open={assigneePopoverOpen} onOpenChange={setAssigneePopoverOpen}>
                                  <PopoverTrigger asChild>
                                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer -ml-2 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground overflow-hidden">
                                            {task.assignee?.avatar_url 
                                                ? <Image src={task.assignee.avatar_url} width={32} height={32} className="w-full h-full object-cover" alt={task.assignee.full_name || ""} /> 
                                                : (task.assignee?.full_name?.charAt(0) || "?")}
                                        </div>
                                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                            {task.assignee?.full_name || "Atribuir a alguém"}
                                        </span>
                                    </div>
                                 </PopoverTrigger>

                                 <PopoverContent className="w-60 p-0 bg-zinc-900 border-white/10" align="start">
                                     <Command className="bg-transparent">
                                         <CommandInput placeholder="Buscar usuário..." className="text-white border-b border-white/5" />
                                         <CommandList className="py-1">
                                             <CommandEmpty className="py-2 text-center text-xs text-zinc-500">Ninguém encontrado.</CommandEmpty>
                                             <CommandGroup>
                                                 {profiles.map(p => (
                                                     <CommandItem 
                                                        key={p.id} 
                                                        value={p.full_name}
                                                        onSelect={() => {
                                                            saveChanges({ assignee_id: p.id });
                                                            setAssigneePopoverOpen(false);
                                                        }}
                                                        className="data-selected:bg-white/10 cursor-pointer flex items-center gap-2 py-2 px-3"
                                                     >
                                                         <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-white">
                                                            {p.full_name?.charAt(0)}
                                                         </div>
                                                         <span className="text-zinc-200">{p.full_name}</span>
                                                         {task.assignee_id === p.id && <Check size={14} className="ml-auto text-emerald-500" />}
                                                     </CommandItem>
                                                 ))}
                                             </CommandGroup>
                                         </CommandList>
                                     </Command>
                                 </PopoverContent>
                             </Popover>
                         </div>

                         {/* Seletor de Data */}
                         <div className="group">
                             <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                                 <CalendarIcon size={14} className="text-zinc-500" /> Data de Entrega
                             </label>
                             <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                                 <PopoverTrigger asChild>
                                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer -ml-2 transition-colors">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center border transition-colors",
                                            task.due_date ? "bg-zinc-900 border-white/10 text-zinc-200" : "bg-zinc-900/50 border-dashed border-zinc-700 text-zinc-600"
                                        )}>
                                            <Clock size={14} />
                                        </div>
                                        <span className={cn("text-sm", task.due_date ? "text-zinc-200" : "text-zinc-500")}>
                                            {task.due_date ? format(new Date(task.due_date), "dd 'de' MMMM", { locale: ptBR }) : "Definir prazo"}
                                        </span>
                                    </div>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-auto p-0 bg-zinc-950 border-white/10 text-white" align="start">
                                     <Calendar
                                        mode="single"
                                        selected={task.due_date ? new Date(task.due_date) : undefined}
                                        onSelect={(date) => {
                                            if (date) {
                                               saveChanges({ due_date: date.toISOString() });
                                               setDatePopoverOpen(false);
                                            }
                                        }}
                                        initialFocus
                                        className="bg-zinc-950 text-white rounded-lg border border-white/5"
                                     />
                                 </PopoverContent>
                             </Popover>
                         </div>

                         {/* Seletor de Prioridade */}
                         <div className="group">
                             <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                                 <Tag size={14} className="text-zinc-500" /> Prioridade
                             </label>
                             <div className="flex gap-2">
                                 {["low", "medium", "high"].map((p) => {
                                     const labels: Record<string, string> = { low: "Baixa", medium: "Média", high: "Alta" };
                                     const isActive = task.priority === p;
                                     return (
                                         <Button 
                                            key={p}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => saveChanges({ priority: p as "low" | "medium" | "high" })}
                                            className={cn(
                                                "flex-1 h-8 text-[10px] font-bold uppercase transition-all border",
                                                isActive 
                                                    ? (p === "high" ? "bg-destructive/10 border-destructive text-destructive hover:bg-destructive/20" 
                                                      : p === "medium" ? "bg-yellow-500/10 border-yellow-500 text-yellow-500 hover:bg-yellow-500/20" 
                                                      : "bg-emerald-500/10 border-emerald-500 text-emerald-500 hover:bg-emerald-500/20")
                                                    : "bg-background border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                                            )}
                                         >
                                             {labels[p]}
                                         </Button>
                                     )
                                 })}

                             </div>
                         </div>

                         {/* Seletor de Entrega */}
                         <div className="group">
                             <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                                 <LinkIcon size={14} className="text-zinc-500" /> Link da Entrega
                             </label>
                             <Input 
                                placeholder="https://..."
                                value={deliveryLink}
                                onChange={(e) => setDeliveryLink(e.target.value)}
                                onBlur={() => saveChanges({ delivery_link: deliveryLink })}
                                className="bg-transparent border-white/10 text-sm h-9"
                             />
                         </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 mt-auto">
                        <div className="text-[10px] text-zinc-600 space-y-1">
                            <p>Criado em: {task.created_at ? format(new Date(task.created_at), "dd/MM/yyyy") : "-"}</p>
                            <p>ID: {task.id.slice(0, 8)}</p>
                        </div>
                    </div>

                </div>
            </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>

  );
}
