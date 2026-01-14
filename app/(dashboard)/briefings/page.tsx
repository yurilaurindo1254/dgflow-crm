"use client";

import { useState } from "react";
import { Plus, Search, FileText, Clock, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useModal } from "@/contexts/modal-context";
import { NewBriefingModal } from "@/components/modals/new-briefing-modal";

import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function BriefingsPage() {
  const { openModal } = useModal();
  const [searchTerm, setSearchTerm] = useState("");
  const [counts, setCounts] = useState({
      total: 0,
      pending: 0,
      filled: 0,
      types: 0
  });

  useEffect(() => {
      async function fetchStats() {
          const { count: templatesCount } = await supabase.from('briefing_templates').select('*', { count: 'exact', head: true });
          const { count: briefingsCount } = await supabase.from('briefings').select('*', { count: 'exact', head: true });
          const { count: pendingCount } = await supabase.from('briefings').select('*', { count: 'exact', head: true }).eq('status', 'pending');
          const { count: filledCount } = await supabase.from('briefings').select('*', { count: 'exact', head: true }).eq('status', 'filled');

          setCounts({
              total: briefingsCount || 0,
              pending: pendingCount || 0,
              filled: filledCount || 0,
              types: templatesCount || 0
          });
      }
      fetchStats();
  }, []);

  const stats = [
    { title: "Total", value: counts.total, icon: FileText, color: "text-zinc-500" },
    { title: "Pendentes", value: counts.pending, icon: Clock, color: "text-amber-500" },
    { title: "Preenchidos", value: counts.filled, icon: CheckCircle, color: "text-emerald-500" },
    { title: "Tipos", value: counts.types, icon: FileText, color: "text-primary-500" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Briefings</h1>
          <p className="text-zinc-400 mt-1">Gerencie briefings dos seus clientes</p>
        </div>
        <div className="flex gap-3">
             <button className="px-4 py-2 bg-zinc-900 border border-white/5 hover:bg-zinc-800 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2">
                <FileText size={16} />
                Meus Templates
             </button>
             <button
               onClick={() => openModal(<NewBriefingModal />)}
               className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-bold text-black shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2"
             >
               <Plus size={18} />
               Novo Briefing
             </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/5 flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-zinc-950 border border-white/5 ${stat.color}`}>
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
            placeholder="Buscar por cliente..." 
            className="bg-zinc-900/50 border-white/5 pl-10 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        </div>
        <select className="bg-zinc-900/50 border-white/5 rounded-lg px-4 text-sm text-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary-500">
            <option>Todos status</option>
            <option>Pendente</option>
            <option>Preenchido</option>
        </select>
         <select className="bg-zinc-900/50 border-white/5 rounded-lg px-4 text-sm text-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary-500">
            <option>Todos tipos</option>
            <option>Logo</option>
            <option>Landing Page</option>
        </select>
      </div>

       {/* Briefings List (Empty State Placeholder for now or actual list later) */}
       <div className="min-h-[400px] flex flex-col items-center justify-center text-zinc-500 gap-4 border border-dashed border-white/5 rounded-2xl bg-zinc-900/20">
            <FileText size={48} className="opacity-20" />
            <p>Nenhum briefing enviado ainda.</p>
            <button 
                onClick={() => openModal(<NewBriefingModal />)}
                className="text-primary-500 font-bold text-sm hover:underline"
            >
                Criar primeiro briefing
            </button>
       </div>

    </div>
  );
}
