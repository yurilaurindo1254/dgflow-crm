"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, FileText, Clock, CheckCircle, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Quote } from "@/lib/schemas/quote";
import { QuoteActions } from "./quote-actions";

interface QuoteWithDetails extends Quote {
  id: string; // Enforcing ID
  created_at: string;
  clients?: {
    name: string;
  };
}

export function QuotesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos"); // 'todos', 'rascunho', 'enviado', 'aprovado', 'rejeitado', 'arquivado'
  const [counts, setCounts] = useState({
      total: 0,
      draft: 0,
      sent: 0,
      approved: 0,
      rejected: 0,
      archived: 0
  });

  const [quotes, setQuotes] = useState<QuoteWithDetails[]>([]);

  const fetchData = useCallback(async () => {
      // Fetch Stats
      const { count: totalCount } = await supabase.from('orcamentos').select('*', { count: 'exact', head: true }).neq('status', 'arquivado').is('deleted_at', null);
      const { count: draftCount } = await supabase.from('orcamentos').select('*', { count: 'exact', head: true }).eq('status', 'rascunho').is('deleted_at', null);
      const { count: sentCount } = await supabase.from('orcamentos').select('*', { count: 'exact', head: true }).eq('status', 'enviado').is('deleted_at', null);
      const { count: approvedCount } = await supabase.from('orcamentos').select('*', { count: 'exact', head: true }).eq('status', 'aprovado').is('deleted_at', null);
      const { count: rejectedCount } = await supabase.from('orcamentos').select('*', { count: 'exact', head: true }).eq('status', 'rejeitado').is('deleted_at', null);
      const { count: archivedCount } = await supabase.from('orcamentos').select('*', { count: 'exact', head: true }).eq('status', 'arquivado').is('deleted_at', null);

      setCounts({
          total: totalCount || 0,
          draft: draftCount || 0,
          sent: sentCount || 0,
          approved: approvedCount || 0,
          rejected: rejectedCount || 0,
          archived: archivedCount || 0
      });

      // Fetch List
      const { data, error } = await supabase
        .from('orcamentos')
        .select(`
            *,
            clients (
                name
            )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      
      if (error) console.error("Quotes Error:", error);
      if (data) setQuotes(data as unknown as QuoteWithDetails[]); 
  }, []);

  useEffect(() => {
      const loadData = async () => {
          await fetchData();
      };
      loadData();
  }, [fetchData]);

  const stats = [
    { title: "Total", value: counts.total, icon: FileText, color: "text-zinc-500" },
    { title: "Rascunhos", value: counts.draft, icon: Clock, color: "text-zinc-400" },
    { title: "Enviados", value: counts.sent, icon: Send, color: "text-blue-500" },
    { title: "Aprovados", value: counts.approved, icon: CheckCircle, color: "text-emerald-500" },
  ];

  // Client-side Filtering
  const filteredQuotes = quotes.filter(quote => {
      // 1. Status Filter
      if (statusFilter === 'todos') {
          if (quote.status === 'arquivado') return false; // Hide archived by default
      } else {
          if (quote.status !== statusFilter) return false;
      }

      // 2. Search Filter
      if (searchTerm) {
          const lower = searchTerm.toLowerCase();
          const matchTitle = quote.titulo?.toLowerCase().includes(lower);
          const matchClient = quote.clients?.name?.toLowerCase().includes(lower);
          if (!matchTitle && !matchClient) return false;
      }

      return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-black/30 backdrop-blur-xl p-6 rounded-xl border border-white/5 flex items-center gap-4 hover:border-white/10 transition-colors shadow-lg">
            <div className={`p-3 rounded-lg bg-black/40 border border-white/5 ${stat.color} shadow-inner`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Input 
            placeholder="Buscar por cliente ou título..." 
            className="bg-black/20 backdrop-blur-md border-white/10 pl-10 text-white focus:border-primary-500/50 focus:ring-primary-500/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        </div>
        <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/20 backdrop-blur-md border-white/10 rounded-lg px-4 text-sm text-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        >
            <option value="todos">Todos status</option>
            <option value="rascunho">Rascunho</option>
            <option value="enviado">Enviado</option>
            <option value="aprovado">Aprovado</option>
            <option value="rejeitado">Rejeitado</option>
            <option value="arquivado">Arquivados ({counts.archived})</option>
        </select>
        <Link
            href="/orcamentos/novo"
            className="ml-auto px-6 py-2 bg-primary-500 hover:bg-primary-600 hover:shadow-[0_0_20px_rgba(121,205,37,0.3)] rounded-lg text-sm font-bold text-black shadow-lg transition-all flex items-center gap-2 group"
        >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            Novo Orçamento
        </Link>
      </div>

       {/* List / Empty State */}
       {filteredQuotes.length === 0 ? (
           <div className="min-h-[400px] flex flex-col items-center justify-center text-zinc-500 gap-4 border border-dashed border-white/10 rounded-2xl bg-black/20 backdrop-blur-sm">
                <div className="p-4 rounded-full bg-black/40 border border-white/5">
                    <FileText size={48} className="opacity-20 text-primary-500" />
                </div>
                <p>Nenhum orçamento encontrado.</p>
                {statusFilter === 'todos' && !searchTerm && (
                    <Link 
                        href="/orcamentos/novo"
                        className="text-primary-500 font-bold text-sm hover:underline hover:text-primary-600 transition-colors"
                    >
                        Criar primeiro orçamento
                    </Link>
                )}
           </div>
       ) : (
           <div className="bg-black/30 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden shadow-2xl">
               <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-white/5 bg-black/40">
                   <div className="col-span-4">Cliente / Título</div>
                   <div className="col-span-2">Status</div>
                   <div className="col-span-2">Data</div>
                   <div className="col-span-2 text-right">Valor</div>
                   <div className="col-span-2 text-center">Ações</div>
               </div>
               <div className="divide-y divide-white/5">
                   {filteredQuotes.map((quote) => (
                       <div key={quote.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group">
                           <div className="col-span-4">
                               <p className="font-bold text-white truncate">{quote.titulo}</p>
                               <p className="text-sm text-zinc-400 truncate">{quote.clients?.name || "Cliente Desconhecido"}</p>
                           </div>
                           <div className="col-span-2">
                               <span className={`
                                   px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide
                                   ${quote.status === 'aprovado' ? 'bg-emerald-500/20 text-emerald-500' : 
                                     quote.status === 'enviado' ? 'bg-blue-500/20 text-blue-500' : 
                                     quote.status === 'rejeitado' ? 'bg-red-500/20 text-red-500' : 
                                     quote.status === 'arquivado' ? 'bg-zinc-500/20 text-zinc-500' : 
                                     'bg-zinc-800 text-zinc-400'}
                               `}>
                                   {quote.status}
                               </span>
                           </div>
                           <div className="col-span-2 text-sm text-zinc-400">
                               {new Date(quote.created_at).toLocaleDateString('pt-BR')}
                           </div>
                           <div className="col-span-2 text-right font-mono text-zinc-300">
                               R$ {quote.total?.toFixed(2)}
                           </div>
                           <div className="col-span-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <QuoteActions quoteId={quote.id} status={quote.status} onUpdate={fetchData} />
                           </div>
                       </div>
                   ))}
               </div>
           </div>
       )}

    </div>
  );
}
