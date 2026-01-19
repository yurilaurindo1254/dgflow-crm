"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
    ScrollText, Plus, Clock, MoreHorizontal, 
    Edit, Trash2, Calendar, FileText 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Script {
    id: string;
    title: string;
    status: 'draft' | 'filming' | 'editing' | 'done';
    updated_at: string;
    estimated_time: string | null;
}

export default function ScriptsListPage() {
    const router = useRouter();
    const [scripts, setScripts] = useState<Script[]>([]);
    const [loading, setLoading] = useState(true);
    const [scriptToDelete, setScriptToDelete] = useState<Script | null>(null);

    // Hoisted function
    async function fetchScripts() {
        setLoading(true);
        const { data, error } = await supabase
            .from('scripts')
            .select('*')
            .order('updated_at', { ascending: false });
        
        if (error) {
            console.error(error);
        } else {
            setScripts(data || []);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchScripts();
    }, []);

    async function handleCreate() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('scripts')
            .insert({
                title: 'Novo Roteiro Sem Título',
                status: 'draft',
                created_by: user.id,
                content: []
            })
            .select()
            .single();

        if (error) {
            console.error(error);
        } else if (data) {
            router.push(`/roteiros/${data.id}`);
        }
    }

    async function handleDelete() {
        if (!scriptToDelete) return;
        
        const { error } = await supabase
            .from('scripts')
            .delete()
            .eq('id', scriptToDelete.id);

        if (error) {
            console.error(error);
        } else {
            setScripts(prev => prev.filter(s => s.id !== scriptToDelete.id));
            setScriptToDelete(null);
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'done': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'editing': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'filming': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'draft': return 'Rascunho';
            case 'filming': return 'Em Gravação';
            case 'editing': return 'Em Edição';
            case 'done': return 'Finalizado';
            default: return status;
        }
    };

    const getDaysAgo = (dateString: string) => {
        const diff = Date.now() - new Date(dateString).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">Sala de Roteiros</h2>
                    <p className="text-zinc-400 text-sm sm:text-base font-medium">Crie, edite e organize seus roteiros de vídeo.</p>
                </div>
                <Button 
                    onClick={handleCreate}
                    className="bg-primary-500 hover:bg-primary-600 text-black font-bold h-12 px-6 rounded-xl shadow-[0_0_20px_rgba(121,205,37,0.3)] transition-all hover:scale-[1.02]"
                >
                    <Plus className="mr-2 h-5 w-5" /> Novo Roteiro
                </Button>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                </div>
            ) : scripts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/20 border border-white/5 rounded-3xl border-dashed">
                    <ScrollText className="h-16 w-16 text-zinc-700 mb-4" />
                    <h3 className="text-white font-bold text-xl mb-2">Nenhum roteiro encontrado</h3>
                    <p className="text-zinc-500 mb-6">Comece criando seu primeiro roteiro para vídeo.</p>
                    <Button onClick={handleCreate} variant="outline" className="border-white/10 hover:bg-white/5">Criar Agora</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scripts.map(script => (
                        <Card key={script.id} className="group bg-zinc-900/40 border-white/5 hover:border-primary-500/30 transition-all p-5 flex flex-col justify-between h-48 hover:shadow-xl relative overflow-hidden">
                             {/* Glow Effect */}
                             <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary-500/10 transition-colors pointer-events-none" />

                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="bg-white/5 p-2 rounded-lg">
                                        <FileText size={20} className="text-zinc-400 group-hover:text-primary-500 transition-colors" />
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
                                                <MoreHorizontal size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10">
                                            <DropdownMenuItem onClick={() => router.push(`/roteiros/${script.id}`)}>
                                                <Edit className="mr-2 h-4 w-4" /> Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                className="text-red-500 focus:text-red-500"
                                                onClick={() => setScriptToDelete(script)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                
                                <div>
                                    <h3 
                                        className="text-white font-bold text-lg line-clamp-1 cursor-pointer hover:text-primary-500 transition-colors"
                                        onClick={() => router.push(`/roteiros/${script.id}`)}
                                    >
                                        {script.title || "Sem Título"}
                                    </h3>
                                    <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1">
                                        <Calendar size={12} />
                                        Atualizado há {getDaysAgo(script.updated_at)} dias
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <Badge variant="outline" className={cn("capitalize border", getStatusColor(script.status))}>
                                    {getStatusLabel(script.status)}
                                </Badge>
                                
                                {script.estimated_time && (
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 bg-black/20 px-2 py-1 rounded-md">
                                        <Clock size={12} />
                                        {script.estimated_time}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

             {/* Delete Alert */}
             <AlertDialog open={!!scriptToDelete} onOpenChange={(open) => !open && setScriptToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Roteiro</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir &quot;{scriptToDelete?.title}&quot;? Esta ação é irreversível.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
