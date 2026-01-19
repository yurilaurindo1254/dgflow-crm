"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Types
interface Profile {
    id: string;
    full_name: string;
    avatar_url: string;
    weekly_capacity: number;
    user_role: string;
}

interface Task {
    id: string;
    title: string;
    estimated_hours: number;
    column_id: string;
    assignee_id: string;
    project_column?: {
        title: string;
    };
}

interface UserWorkload {
    profile: Profile;
    tasks: Task[];
    totalHours: number;
    utilization: number; // 0-100
}

export default function CapacityPage() {
    const router = useRouter();
    const [teamData, setTeamData] = useState<UserWorkload[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCapacityData();
    }, []);

    async function fetchCapacityData() {
        setLoading(true);

        // 1. Fetch Profiles (Filter only internal staff if possible, or all)
        // Assuming 'user_role' != 'client' implies staff.
        // Also fetch active tasks for these users.
        
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .neq('user_role', 'client') // Exclude clients
            .order('full_name');

        if (profileError) {
            console.error("Error fetching profiles:", profileError);
            setLoading(false);
            return;
        }

        // 2. Fetch Tasks (Assigned to these profiles)
        // Ideally we filter out 'Done' columns. 
        // We first get columns to identify which are "Done".
        const { data: columns } = await supabase
            .from('project_columns')
            .select('id, title');
        
        // Naive filter: Exclude columns with "Done", "Concluído", "Entregue" in title
        const doneColumnIds = columns
            ?.filter(c => /done|concluído|entregue|finalizado/i.test(c.title))
            .map(c => c.id) || [];

        const { data: tasks, error: taskError } = await supabase
            .from('tasks')
            .select(`
                id, 
                title, 
                estimated_hours, 
                column_id, 
                assignee_id
            `)
            .not('assignee_id', 'is', null);

        if (taskError) {
            console.error("Error fetching tasks:", taskError);
        }

        // 3. Aggregate
        const workload: UserWorkload[] = (profiles || []).map(profile => {
            // Filter tasks for this user AND not in Done columns
            const userTasks = (tasks || []).filter(t => 
                t.assignee_id === profile.id && 
                !doneColumnIds.includes(t.column_id)
            );

            const totalHours = userTasks.reduce((acc, t) => acc + (t.estimated_hours || 1), 0); // Default to 1h if null
            // Default capacity 40 if null (handled in DB default, but safe fallback here)
            const capacity = profile.weekly_capacity || 40; 
            
            return {
                profile,
                tasks: userTasks,
                totalHours,
                utilization: Math.min(Math.round((totalHours / capacity) * 100), 100)
            };
        });

        // Sort by utilization (Highest first) to show bottlenecks
        workload.sort((a, b) => b.utilization - a.utilization);

        setTeamData(workload);
        setLoading(false);
    }

    const getStatusColor = (percentage: number) => {
        if (percentage >= 80) return "text-red-500";
        if (percentage >= 50) return "text-yellow-500";
        return "text-emerald-500";
    };

    const getProgressBarColor = (percentage: number) => {
        if (percentage >= 80) return "bg-red-500";
        if (percentage >= 50) return "bg-yellow-500";
        return "bg-emerald-500";
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center text-white">Carregando Capacidade...</div>;
    }

    return (
        <div className="space-y-8 pb-20">
             {/* Header */}
             <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Gestão de Capacidade</h2>
                <p className="text-zinc-400">Monitore a carga de trabalho da equipe em tempo real.</p>
            </div>

            <div className="grid gap-6">
                {teamData.map((data) => (
                    <Card key={data.profile.id} className="bg-zinc-900/40 border-white/5 overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border-2 border-white/10">
                                        <AvatarImage src={data.profile.avatar_url} />
                                        <AvatarFallback>{data.profile.full_name?.substring(0,2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-white text-lg">{data.profile.full_name}</CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs uppercase bg-black/40 border-white/10">
                                                {data.profile.user_role}
                                            </Badge>
                                            <span className={getStatusColor(data.utilization)}>
                                                {data.utilization}% Ocupado
                                            </span>
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-white">
                                        {data.totalHours} <span className="text-sm font-normal text-zinc-500">/ {data.profile.weekly_capacity || 40}h</span>
                                    </div>
                                    <p className="text-xs text-zinc-500">Estimado vs Capacidade</p>
                                </div>
                            </div>
                        </CardHeader>
                        
                        <CardContent>
                            <div className="mt-2 mb-6">
                                <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-500 ${getProgressBarColor(data.utilization)}`} 
                                        style={{ width: `${data.utilization}%` }}
                                    />
                                </div>
                            </div>

                            <Accordion type="single" collapsible className="w-full border-t border-white/5 pt-2">
                                <AccordionItem value="tasks" className="border-none">
                                    <AccordionTrigger className="hover:no-underline py-2 text-sm text-zinc-400 hover:text-white">
                                        Ver {data.tasks.length} Tarefas Atribuídas
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-2 mt-2">
                                            {data.tasks.length === 0 ? (
                                                <p className="text-zinc-600 text-sm italic py-2">Nenhuma tarefa ativa neste momento.</p>
                                            ) : (
                                                data.tasks.map(task => (
                                                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/40 transition-colors border border-white/5">
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="bg-primary-500/10 p-2 rounded text-primary-500">
                                                                <Clock size={14} />
                                                            </div>
                                                            <div className="truncate">
                                                                <span className="text-zinc-200 text-sm font-medium block truncate">{task.title}</span>
                                                                <span className="text-zinc-500 text-xs">{task.estimated_hours}h estimadas</span>
                                                            </div>
                                                        </div>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="text-zinc-500 hover:text-white"
                                                            title="Reatribuir (Em breve)"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                alert("Funcionalidade de reatribuição rápida em desenvolvimento.");
                                                            }}
                                                        >
                                                            <ArrowRightLeft size={16} />
                                                        </Button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
