"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Activity 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Profile {
  full_name: string;
  client_id: string;
  client?: {
    name: string;
  };
}

interface TaskSummary {
  id: string;
  title: string;
  status: string;
  updated_at: string;
  created_at: string;
}

interface ActivityItem {
  id: string;
  details: string;
  created_at: string;
  task?: {
    title: string;
  };
}

export default function PortalDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [metrics, setMetrics] = useState<{
    totalSpend: number;
    totalLeads: number;
    totalSales: number;
    cpl: number;
  } | null>(null);
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortalData() {
      try {
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: prof } = await supabase
          .from('profiles')
          .select('*, client:clients(name)')
          .eq('id', user.id)
          .single();
        
        setProfile(prof as Profile);

        if (prof?.client_id) {
          const { data: met } = await supabase
            .from('marketing_metrics')
            .select('*')
            .eq('client_id', prof.client_id)
            .order('date', { ascending: false });
          
          const totalSpend = met?.reduce((acc: number, curr: { spend: number }) => acc + Number(curr.spend), 0) || 0;
          const totalLeads = met?.reduce((acc: number, curr: { leads: number }) => acc + Number(curr.leads), 0) || 0;
          const totalSales = met?.reduce((acc: number, curr: { sales: number }) => acc + Number(curr.sales), 0) || 0;
          const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0;

          setMetrics({ totalSpend, totalLeads, totalSales, cpl });

          const { data: tsk } = await supabase
            .from('tasks')
            .select('*')
            .eq('client_id', prof.client_id)
            .limit(5);
          setTasks((tsk as TaskSummary[]) || []);

          const { data: act } = await supabase
            .from('task_activities')
            .select('*, task:tasks(title)')
            .order('created_at', { ascending: false })
            .limit(10);
          setActivities((act as ActivityItem[]) || []);
        }
      } catch (err) {
        console.error("Error loading portal data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPortalData();
  }, []);

  if (loading) return <div className="p-8 text-zinc-500 animate-pulse">Carregando portal...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Olá, {profile?.full_name?.split(' ')[0] || 'Cliente'}
        </h1>
        <p className="text-zinc-500 mt-1">
          Acompanhe o desempenho da <span className="text-zinc-300 font-medium">{profile?.client?.name || 'sua empresa'}</span> em tempo real.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Investimento Mensal" 
          value={`R$ ${metrics?.totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          description="Total investido em Ads"
        />
        <KpiCard 
          title="Leads Gerados" 
          value={metrics?.totalLeads ?? 0}
          icon={Users}
          description="Contatos qualificados"
          trend="+12%"
        />
        <KpiCard 
          title="CPL Médio" 
          value={`R$ ${metrics?.cpl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          description="Custo por Lead"
          color="text-emerald-500"
        />
        <KpiCard 
          title="Vendas Totais" 
          value={metrics?.totalSales ?? 0}
          icon={CheckCircle2}
          description="Conversões efetuadas"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline Activities */}
        <Card className="lg:col-span-2 bg-zinc-900/50 border-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="size-5 text-primary-500" />
              Timeline de Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activities.length > 0 ? activities.map((act) => (
                <div key={act.id} className="flex gap-4 group">
                  <div className="relative">
                    <div className="size-2 rounded-full bg-primary-500 mt-2 z-10 relative shadow-[0_0_8px_rgba(121,205,37,0.5)]" />
                    <div className="absolute top-4 left-[3px] bottom-[-24px] w-[2px] bg-white/5 group-last:hidden" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300">
                      <span className="text-white font-medium">{act.details}</span>
                      {act.task && <span className="text-zinc-500"> na tarefa </span>}
                      {act.task && <span className="text-primary-400 font-medium cursor-pointer hover:underline">{act.task.title}</span>}
                    </p>
                    <span className="text-[10px] text-zinc-600 block mt-1 uppercase tracking-wider">
                      {format(new Date(act.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-zinc-600 text-sm italic">Nenhuma atividade recente encontrada.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tasks Preview */}
        <Card className="bg-zinc-900/50 border-white/5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Projetos em Andamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.length > 0 ? tasks.map((task) => (
              <div key={task.id} className="p-3 rounded-lg bg-white/2 border border-white/5">
                <p className="text-sm font-medium text-zinc-200 line-clamp-1">{task.title}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-[10px] py-0 h-5 border-white/10 text-zinc-500 capitalize">
                    {task.status || 'Em produção'}
                  </Badge>
                  <span className="text-[10px] text-zinc-600">
                    Última att: {format(new Date(task.updated_at || task.created_at), "dd/MM")}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-zinc-600 text-sm">Nenhum projeto pendente.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  trend?: string;
  color?: string;
}

function KpiCard({ title, value, icon: Icon, description, trend, color = "text-white" }: KpiCardProps) {
  return (
    <Card className="bg-zinc-900/50 border-white/5 overflow-hidden group hover:border-white/10 transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{title}</span>
          <Icon className="size-5 text-zinc-600 group-hover:text-primary-500 transition-colors" />
        </div>
        <div className="flex items-baseline gap-2">
          <h2 className={cn("text-2xl font-bold tracking-tight", color)}>{value}</h2>
          {trend && <span className="text-[10px] font-bold text-emerald-500">{trend}</span>}
        </div>
        <p className="text-[10px] text-zinc-600 mt-1 uppercase truncate">{description}</p>
      </CardContent>
    </Card>
  );
}

function cn(...inputs: (string | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(" ");
}


