"use client";

import { useEffect, useState, useCallback } from "react";
import { 
    Search, Plus, Mail, Phone, MoreHorizontal, Filter, 
    Edit, Trash2, LayoutGrid, List, 
    Clock, MessageSquare,
    ChevronRight, Download, FileText, Users
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    status: 'active' | 'lead' | 'churn' | string;
    ltv: number;
    activeProjects: number;
    lastInteraction: string;
    tags: string[];
}

export default function ClientsPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'lead' | 'churn'>('all');

    const fetchClients = useCallback(async () => {
        setLoading(true);
        try {
            interface DBTask {
                status: string;
                updated_at: string;
            }
            interface DBOrcamento {
                total: number;
                status: string;
            }
            interface DBClient {
                id: string;
                name: string;
                email: string;
                phone: string;
                company: string;
                status: string;
                created_at: string;
                tasks: DBTask[];
                orcamentos: DBOrcamento[];
            }

            // Attempt joined fetch first
            const { data, error } = await supabase
                .from('clients')
                .select(`
                    *,
                    tasks(status, updated_at),
                    orcamentos(total, status)
                `)
                .order('name');

            if (error) {
                console.warn("Join fetch failed, falling back to separate fetches:", error);
                
                // Fallback: Fetch clients then related data
                const { data: clientsData, error: clientsError } = await supabase
                    .from('clients')
                    .select('*')
                    .order('name');

                if (clientsError) throw clientsError;

                if (!clientsData || clientsData.length === 0) {
                    setClients([]);
                    return;
                }

                const enriched = await Promise.all(clientsData.map(async (client: Omit<DBClient, 'tasks' | 'orcamentos'>) => {
                    const { data: tasks } = await supabase.from('tasks').select('status, updated_at').eq('client_id', client.id);
                    const { data: orcamentos } = await supabase.from('orcamentos').select('total, status').eq('cliente_id', client.id);
                    
                    return {
                        ...client,
                        tasks: (tasks as DBTask[]) || [],
                        orcamentos: (orcamentos as DBOrcamento[]) || []
                    } as DBClient;
                }));

                const finalClients = enriched.map((c: DBClient) => {
                    const activeProjects = c.tasks?.filter((t: DBTask) => ['in_progress', 'todo'].includes(t.status)).length || 0;
                    const ltv = c.orcamentos?.filter((o: DBOrcamento) => o.status === 'aprovado').reduce((acc: number, o: DBOrcamento) => acc + (o.total || 0), 0) || 0;
                    const lastTaskUpdate = c.tasks?.length > 0 ? Math.max(...c.tasks.map((t: DBTask) => new Date(t.updated_at).getTime())) : 0;
                    const lastInteraction = lastTaskUpdate > 0 ? new Date(lastTaskUpdate).toISOString() : c.created_at;

                    return {
                        ...c,
                        activeProjects,
                        ltv,
                        lastInteraction,
                        tags: ['VIP', 'Indicação'].slice(0, Math.floor(Math.random() * 2) + 1)
                    };
                });

                setClients(finalClients);
                return;
            }

            if (!data) {
                setClients([]);
                return;
            }

            const enrichedClients = (data as unknown as DBClient[]).map((c) => {
                const activeProjects = c.tasks?.filter((t) => ['in_progress', 'todo'].includes(t.status)).length || 0;
                const ltv = c.orcamentos?.filter((o) => o.status === 'aprovado').reduce((acc, o) => acc + (o.total || 0), 0) || 0;
                
                const lastTaskUpdate = c.tasks?.length > 0 ? Math.max(...c.tasks.map((t) => new Date(t.updated_at).getTime())) : 0;
                const lastInteraction = lastTaskUpdate > 0 ? new Date(lastTaskUpdate).toISOString() : c.created_at;

                return {
                    ...c,
                    activeProjects,
                    ltv,
                    lastInteraction,
                    tags: ['VIP', 'Indicação'].slice(0, Math.floor(Math.random() * 2) + 1)
                };
            });

            setClients(enrichedClients);
        } catch (error) {
            console.error("Critical error fetching clients:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             client.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const handleWhatsApp = (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    const handleEmail = (email: string) => {
        window.location.href = `mailto:${email}`;
    };

    const handleExportCSV = () => {
        if (filteredClients.length === 0) return;
        
        const headers = ["Nome", "Empresa", "Email", "Telefone", "Status", "LTV", "Projetos Ativos"];
        const rows = filteredClients.map(c => [
            c.name,
            c.company || "-",
            c.email,
            c.phone,
            c.status,
            c.ltv,
            c.activeProjects
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `clientes_dgflow_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenDetails = (client: Client) => {
        setSelectedClient(client);
        setIsSheetOpen(true);
    };

    const handleDeleteClient = async () => {
        if (!clientToDelete) return;

        setIsDeleting(true);
        try {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', clientToDelete.id);

            if (error) throw error;

            setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
            setClientToDelete(null);
        } catch (error) {
            console.error("Error deleting client:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">Gestão de Clientes</h2>
                    <p className="text-zinc-400 text-sm sm:text-base font-medium">CRM Integrado • Acompanhe o valor e a saúde da sua base.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-zinc-900/50 p-1 rounded-xl border border-white/5 flex">
                        <Button 
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="rounded-lg"
                        >
                            <LayoutGrid size={18} />
                        </Button>
                        <Button 
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="rounded-lg"
                        >
                            <List size={18} />
                        </Button>
                    </div>
                    <Button className="bg-white text-black hover:bg-zinc-200 rounded-xl font-bold h-11 px-6 shadow-xl transition-all hover:scale-[1.02] active:scale-95">
                        <Plus className="mr-2 h-5 w-5" /> Novo Cliente
                    </Button>
                </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 bg-zinc-900/40 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nome, empresa ou email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-950/50 border-none rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-primary-500/50 transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex-1 sm:flex-none border-white/10 bg-zinc-900/50 hover:bg-white/5 rounded-xl h-12 px-5 text-zinc-300">
                                <Filter className="mr-2 h-4 w-4" /> 
                                {statusFilter === 'all' ? 'Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-zinc-950 border-white/10 text-white">
                            <DropdownMenuItem onClick={() => setStatusFilter('all')}>Todos</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('active')}>Ativo</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('lead')}>Lead</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('churn')}>Churn</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button 
                        variant="outline" 
                        onClick={handleExportCSV}
                        className="border-white/10 bg-zinc-900/50 hover:bg-white/5 rounded-xl h-12 px-4 text-zinc-300"
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Main Content View */}
            {loading ? (
                <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                    <p className="text-zinc-500 font-medium animate-pulse">Carregando CRM...</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                            <Card key={client.id} className="group relative overflow-hidden bg-zinc-900/40 border-white/5 hover:border-primary-500/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                                {/* Decorative Glow */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary-500/10 transition-colors" />

                                <div className="p-6 space-y-6">
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-14 w-14 border border-white/10 bg-zinc-950 ring-2 ring-primary-500/0 group-hover:ring-primary-500/20 transition-all">
                                                <AvatarFallback className="text-xl font-bold bg-linear-to-br from-zinc-800 to-zinc-900 text-white">
                                                    {client.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight">{client.name}</h3>
                                                <p className="text-zinc-500 text-sm font-medium">{client.company || 'Particular'}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={cn(
                                            "capitalize border-none",
                                            client.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-400"
                                        )}>
                                            {client.status || 'Ativo'}
                                        </Badge>
                                    </div>

                                    {/* Mini Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1">Lifetime Value</p>
                                            <p className="text-white font-bold">{formatCurrency(client.ltv)}</p>
                                        </div>
                                        <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1">Projetos Ativos</p>
                                            <p className="text-white font-bold">{client.activeProjects} em curso</p>
                                        </div>
                                    </div>

                                    {/* Details / Meta */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                                            <Clock size={14} className="text-zinc-600" />
                                            <span>Visto por último {new Date(client.lastInteraction).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {client.tags.map(tag => (
                                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/5 text-primary-400 border border-primary-500/10">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="pt-4 flex items-center gap-2 border-t border-white/5">
                                        <button 
                                            onClick={() => handleOpenDetails(client)}
                                            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white border border-white/5 h-9 rounded-lg text-xs font-bold uppercase transition-colors"
                                        >
                                            Ver Painel
                                        </button>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleWhatsApp(client.phone);
                                            }}
                                            className="h-11 w-11 sm:h-9 sm:w-9 text-zinc-500 hover:text-[#25D366] hover:bg-[#25D366]/10"
                                        >
                                            <Phone size={20} className="sm:size-[18px]" />
                                        </Button>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEmail(client.email);
                                            }}
                                            className="h-11 w-11 sm:h-9 sm:w-9 text-zinc-500 hover:text-primary-400 hover:bg-primary-500/10"
                                        >
                                            <Mail size={20} className="sm:size-[18px]" />
                                        </Button>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setClientToDelete(client);
                                            }}
                                            className="h-11 w-11 sm:h-9 sm:w-9 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                                        >
                                            <Trash2 size={20} className="sm:size-[18px]" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center bg-zinc-900/20 border border-white/5 border-dashed rounded-3xl">
                            <Users className="h-12 w-12 text-zinc-700 mb-4" />
                            <p className="text-zinc-500 font-medium text-lg">Nenhum cliente encontrado</p>
                            <p className="text-zinc-600 text-sm mt-1">Tente ajustar seus filtros ou cadastre um novo cliente.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="hover:bg-transparent border-white/5">
                                <TableHead className="text-zinc-400 py-4 pl-6">Cliente</TableHead>
                                <TableHead className="text-zinc-400">Status</TableHead>
                                <TableHead className="text-zinc-400">Empresa</TableHead>
                                <TableHead className="text-zinc-400">Projetos</TableHead>
                                <TableHead className="text-zinc-400 text-right">LTV</TableHead>
                                <TableHead className="text-zinc-400 text-right pr-6">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClients.map((client) => (
                                <TableRow key={client.id} className="hover:bg-white/5 border-white/5 group transition-colors cursor-pointer" onClick={() => handleOpenDetails(client)}>
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-white/10">
                                                <AvatarFallback className="text-xs font-bold bg-zinc-800 text-white">
                                                    {client.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold group-hover:text-primary-400 transition-colors">{client.name}</span>
                                                <span className="text-zinc-500 text-xs">{client.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(
                                            "capitalize border-none h-6 text-[10px]",
                                            client.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-400"
                                        )}>
                                            {client.status || 'Ativo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-zinc-400">{client.company || '-'}</TableCell>
                                    <TableCell className="text-zinc-400 font-medium">{client.activeProjects} ativos</TableCell>
                                    <TableCell className="text-right text-white font-bold">{formatCurrency(client.ltv)}</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                                                    <MoreHorizontal size={20} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10">
                                                <DropdownMenuItem onClick={() => handleOpenDetails(client)}>
                                                    <ChevronRight className="mr-2 h-4 w-4" /> Detalhes
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleWhatsApp(client.phone);
                                                }}>
                                                    <Phone className="mr-2 h-4 w-4 text-[#25D366]" /> WhatsApp
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEmail(client.email);
                                                }}>
                                                    <Mail className="mr-2 h-4 w-4 text-primary-400" /> Email
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/5" />
                                                <DropdownMenuItem 
                                                    className="text-red-500 focus:text-red-500"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setClientToDelete(client);
                                                    }}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Client Details Side-Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="bg-zinc-950 border-white/10 sm:max-w-xl overflow-y-auto">
                    {selectedClient && (
                        <div className="space-y-8 py-4">
                            <SheetHeader>
                                <div className="flex items-center gap-6 mb-6">
                                    <Avatar className="h-20 w-20 border-2 border-primary-500/20 shadow-2xl">
                                        <AvatarFallback className="text-2xl font-bold bg-linear-to-br from-zinc-800 to-zinc-900 text-white">
                                            {selectedClient.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <SheetTitle className="text-3xl font-extrabold tracking-tight underline decoration-primary-500/50 decoration-4 underline-offset-4">
                                            {selectedClient.name}
                                        </SheetTitle>
                                        <div className="flex items-center gap-3 text-zinc-500">
                                            <p className="font-medium">{selectedClient.company || 'Pessoa Física'}</p>
                                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                            <Badge variant="outline" className="bg-primary-500/10 text-primary-400 border-none px-2 h-5">ID: {selectedClient.id.slice(0, 8)}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </SheetHeader>

                            <Tabs defaultValue="perfil" className="w-full">
                                <TabsList className="bg-zinc-900/50 border border-white/5 p-1 rounded-xl w-full justify-start mb-6">
                                    <TabsTrigger value="perfil" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Perfil</TabsTrigger>
                                    <TabsTrigger value="projetos" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Projetos</TabsTrigger>
                                    <TabsTrigger value="financeiro" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Financeiro</TabsTrigger>
                                    <TabsTrigger value="arquivos" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Arquivos</TabsTrigger>
                                </TabsList>

                                <TabsContent value="perfil" className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        <Card className="bg-zinc-900/40 border-white/5 p-5">
                                            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                                <Edit size={16} className="text-primary-500" /> Dados de Contato
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                    <span className="text-zinc-500 text-sm">Email</span>
                                                    <span className="text-white font-medium">{selectedClient.email}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                    <span className="text-zinc-500 text-sm">Telefone</span>
                                                    <span className="text-white font-medium">{selectedClient.phone}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                    <span className="text-zinc-500 text-sm">Status Atual</span>
                                                    <Badge className="bg-emerald-500 text-white border-none">{selectedClient.status}</Badge>
                                                </div>
                                            </div>
                                        </Card>
                                        
                                        <Card className="bg-zinc-900/40 border-white/5 p-5">
                                            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                                <MessageSquare size={16} className="text-primary-500" /> Notas Internas
                                            </h4>
                                            <p className="text-zinc-500 text-sm leading-relaxed">
                                                Cliente interessado em projetos de branding de longo prazo. Possui preferência por comunicação direta via WhatsApp.
                                            </p>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="projetos" className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-white font-bold">Projetos Recentes</h4>
                                        <Button size="sm" variant="ghost" className="text-primary-500 hover:text-primary-400">Novo Projeto</Button>
                                    </div>
                                    <div className="space-y-3">
                                        {[1, 2].map(i => (
                                            <Card key={i} className="bg-zinc-900/40 border-white/5 p-4 hover:border-white/10 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h5 className="text-white font-bold text-sm mb-1">Identidade Visual - Fase {i}</h5>
                                                        <p className="text-xs text-zinc-500">Iniciado em 1{i}/01/2026</p>
                                                    </div>
                                                    <Badge className="bg-primary-500/10 text-primary-400 border-none text-[10px]">Em curso</Badge>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="financeiro" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                                            <p className="text-xs text-zinc-500 mb-1">Total Pago</p>
                                            <p className="text-xl font-bold text-emerald-500">{formatCurrency(selectedClient.ltv)}</p>
                                        </div>
                                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                                            <p className="text-xs text-zinc-500 mb-1">Pendente</p>
                                            <p className="text-xl font-bold text-rose-500">{formatCurrency(0)}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-white font-bold text-sm mb-2">Últimos Orçamentos</h4>
                                        {[1].map(i => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-zinc-900/30 rounded-lg border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <FileText size={18} className="text-zinc-600" />
                                                    <div className="flex flex-col">
                                                        <span className="text-white text-xs font-bold">PROPOSTA_#00{i}</span>
                                                        <span className="text-zinc-500 text-[10px]">10 Jan 2026</span>
                                                    </div>
                                                </div>
                                                <span className="text-white font-bold text-xs">{formatCurrency(5000)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="arquivos" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="group flex flex-col items-center justify-center p-6 bg-zinc-900/30 rounded-2xl border border-white/5 hover:border-primary-500/20 transition-all cursor-pointer">
                                                <div className="p-3 bg-white/5 rounded-xl mb-3 group-hover:bg-primary-500/10 transition-colors">
                                                    <FileText size={24} className="text-zinc-500 group-hover:text-primary-500" />
                                                </div>
                                                <span className="text-white text-xs font-medium">Contrato_{i}.pdf</span>
                                                <span className="text-zinc-600 text-[10px] mt-1">2.4 MB</span>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="pt-6 border-t border-white/5 flex gap-3">
                                <Button className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl h-12">
                                    <Plus className="mr-2 h-4 w-4" /> Novo Projeto
                                </Button>
                                <Button variant="outline" className="flex-1 border-white/10 hover:bg-white/5 text-white font-bold rounded-xl h-12">
                                    <Edit className="mr-2 h-4 w-4" /> Editar Perfil
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Deletion Confirmation Dialog */}
            <AlertDialog open={!!clientToDelete} onOpenChange={(open: boolean) => !open && setClientToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir o cliente <span className="text-white font-bold">{clientToDelete?.name}</span>? 
                            Esta ação não pode ser desfeita e removerá todos os dados associados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                handleDeleteClient();
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white border-none"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
