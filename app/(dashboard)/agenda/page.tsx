"use client";

import { useState, useEffect } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  parseISO
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import { useModal } from "@/contexts/modal-context";
import { NewTaskModal } from "@/components/modals/new-task-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'task' | 'finance' | 'google';
  status?: string;
}

interface Task {
  id: string;
  title: string;
  due_date: string;
  status: string;
}

interface Transaction {
  id: string;
  description: string;
  due_date: string;
  type: 'income' | 'expense';
  status: string;
}

interface GoogleEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
}

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const { openModal } = useModal();
  const searchParams = useSearchParams();

  // Handle Google Auth Return
  useEffect(() => {
    const success = searchParams.get('success');
    if (success) {
        // Limpa a URL para ficar bonita
        window.history.replaceState(null, '', '/agenda');
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchEvents() {
      // 1. Fetch Tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, due_date, status')
        .not('due_date', 'is', null)
        .returns<Task[]>();

      // 2. Fetch Finance
      const { data: transactions } = await supabase
        .from('transactions')
        .select('id, description, due_date, type, status')
        .not('due_date', 'is', null)
        .returns<Transaction[]>();

      // 3. Fetch Google Calendar
      let googleEventsMapped: Event[] = [];
      try {
          const res = await fetch('/api/calendar/events');
          if (res.ok) {
              const data = await res.json();
              if (data.connected) {
                  setIsConnected(true);
                  if (data.events) {
                      googleEventsMapped = data.events.map((e: GoogleEvent) => ({
                          id: e.id,
                          title: e.summary || 'Sem título',
                          date: parseISO(e.start.dateTime || e.start.date || new Date().toISOString()),
                          type: 'google' as const,
                          status: 'confirmed'
                      }));
                  }
              }
          }
      } catch (err) {
          console.error("Failed to fetch google events", err);
      }

      const taskEvents = (tasks || []).map((t) => ({
        id: t.id,
        title: t.title,
        date: parseISO(t.due_date),
        type: 'task' as const,
        status: t.status
      }));

      const financeEvents = (transactions || []).map((t) => ({
        id: t.id,
        title: `${t.type === 'income' ? 'Receber:' : 'Pagar:'} ${t.description}`,
        date: parseISO(t.due_date),
        type: 'finance' as const,
        status: t.status
      }));

      setEvents([...taskEvents, ...financeEvents, ...googleEventsMapped]);
      setLoading(false);
    }

    fetchEvents();
  }, []);

  const handleConnect = () => {
      // Redireciona para rota de auth
      window.location.href = '/api/auth/google';
  };

  const handleAddTask = () => {
      // Abre o modal passando a data selecionada atualmente
      openModal(<NewTaskModal initialDate={selectedDate} />);
  };

  // Calendar Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const selectedDayEvents = events.filter(event => isSameDay(event.date, selectedDate));

  // Stats for the month
  const monthlyTasks = events.filter(e => e.type === 'task' && isSameMonth(e.date, currentDate));
  const pendingTasks = monthlyTasks.filter(e => e.status !== 'done').length;

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header & Connect Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h2 className="text-3xl font-bold tracking-tight text-white">Agenda</h2>
             <p className="text-zinc-400">Gerencie prazos, finanças e reuniões em um só lugar.</p>
          </div>
          
          <Card className="flex items-center gap-4 p-2 pl-4 bg-zinc-900 border-white/10">
              <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-400 uppercase">Google Calendar</span>
                  <span className={clsx("text-xs flex items-center gap-1", isConnected ? "text-emerald-500" : "text-zinc-500")}>
                      {isConnected ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {isConnected ? "Sincronizado" : "Desconectado"}
                  </span>
              </div>
              {isConnected ? (
                  <Button variant="ghost" size="sm" className="text-zinc-500 cursor-default hover:bg-transparent" disabled>
                      Conectado
                  </Button>
              ) : (
                <Button 
                    onClick={handleConnect}
                    size="sm"
                    className="bg-white text-black hover:bg-zinc-200 font-bold"
                >
                    Conectar
                </Button>
              )}
          </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Main Calendar Area */}
        <Card className="flex-1 bg-zinc-900/50 backdrop-blur-sm border-white/5 p-6 flex flex-col overflow-hidden">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold capitalize text-white flex items-center gap-2">
                    {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                    <Badge variant="outline" className="text-zinc-400 border-white/10 font-normal">
                        {monthlyTasks.length} eventos
                    </Badge>
                </h3>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth} className="border-white/10 hover:bg-white/5">
                        <ChevronLeft size={18} />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth} className="border-white/10 hover:bg-white/5">
                        <ChevronRight size={18} />
                    </Button>
                </div>
            </div>

            {/* Week Headers */}
            <div className="grid grid-cols-7 mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="text-center text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary-500" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
                    {calendarDays.map((day) => {
                        const dayEvents = events.filter(e => isSameDay(e.date, day));
                        const hasTask = dayEvents.some(e => e.type === 'task');
                        const hasFinance = dayEvents.some(e => e.type === 'finance');
                        const hasGoogle = dayEvents.some(e => e.type === 'google');
                        
                        const isSelected = isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isTodayDate = isToday(day);

                        return (
                            <div 
                                key={day.toString()} 
                                onClick={() => setSelectedDate(day)}
                                className={clsx(
                                    "relative rounded-xl border flex flex-col items-center justify-start pt-2 cursor-pointer transition-all hover:bg-white/5 min-h-[80px]",
                                    isSelected ? "bg-white/10 border-primary-500 ring-1 ring-primary-500/50" : "border-transparent bg-zinc-900/30",
                                    !isCurrentMonth && "opacity-30 grayscale"
                                )}
                            >
                                <span className={clsx(
                                    "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-1",
                                    isTodayDate ? "bg-primary-500 text-black" : "text-zinc-300"
                                )}>
                                    {format(day, 'd')}
                                </span>
                                
                                {/* Event Dots */}
                                <div className="flex gap-1 mt-1">
                                    {hasTask && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_currentColor]"></div>}
                                    {hasFinance && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_currentColor]"></div>}
                                    {hasGoogle && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_currentColor]"></div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>

        {/* Sidebar Info */}
        <div className="w-full lg:w-96 space-y-6 flex flex-col">
            
            {/* Selected Date Details */}
            <Card className="bg-zinc-900 border-white/10 p-0 overflow-hidden flex-1 flex flex-col">
                <div className="p-6 border-b border-white/10 bg-zinc-950/50">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-primary-500 uppercase tracking-wider">
                            {format(selectedDate, "EEEE", { locale: ptBR })}
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-white">
                        {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 min-h-[300px]">
                    {selectedDayEvents.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-10">
                            <Clock size={40} className="mb-4 opacity-20" />
                            <p className="text-sm font-medium">Agenda livre</p>
                            <p className="text-xs text-zinc-600">Nenhum evento para este dia</p>
                        </div>
                    ) : (
                        selectedDayEvents.map((event, i) => (
                            <div key={`${event.id}-${i}`} className="group flex items-start gap-3 p-3 rounded-xl bg-zinc-950/80 border border-white/5 hover:border-white/20 transition-all hover:translate-x-1">
                                <div className={clsx(
                                    "p-2 rounded-lg mt-0.5 shrink-0",
                                    event.type === 'task' ? "bg-purple-500/10 text-purple-400" : 
                                    event.type === 'finance' ? "bg-green-500/10 text-green-400" :
                                    "bg-blue-500/10 text-blue-400"
                                )}>
                                    {event.type === 'task' ? <CheckCircle2 size={16} /> : 
                                     event.type === 'finance' ? <DollarSignIcon size={16} /> :
                                     <CalendarIcon size={16} />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{event.title}</p>
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wide mt-0.5">
                                        {event.type === 'task' ? 'Tarefa' : 
                                         event.type === 'finance' ? 'Financeiro' :
                                         'Google Calendar'}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-white/10 bg-zinc-950/30">
                    <Button 
                        onClick={handleAddTask}
                        className="w-full bg-primary-500 hover:bg-primary-600 text-black font-bold shadow-lg shadow-primary-500/20"
                    >
                        <Plus size={18} className="mr-2" />
                        Adicionar Lembrete
                    </Button>
                </div>
            </Card>

            {/* Monthly Summary Widget */}
            <Card className="bg-zinc-900/50 border-white/5 p-5">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Resumo do Mês</h4>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-300">Tarefas Pendentes</span>
                        <Badge variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700">{pendingTasks}</Badge>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-300">Eventos Externos</span>
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">{events.filter(e => e.type === 'google' && isSameMonth(e.date, currentDate)).length}</Badge>
                    </div>
                </div>
            </Card>

        </div>
      </div>
    </div>
  );
}

// Icon helper
function DollarSignIcon({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="1" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    )
}
