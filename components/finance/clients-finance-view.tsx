"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Users, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils/format";

interface ClientSummary {
  id: string;
  name: string;
  totalIncome: number;
  receivedIncome: number;
  pendingIncome: number;
}

export const ClientsFinanceView = () => {
  const [data, setData] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    // Group transactions by client
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*, clients(*)');

    if (transactions) {
      const grouped = transactions.reduce((acc: Record<string, ClientSummary>, curr: any) => {
        if (!curr.clients) return acc;
        const clientId = curr.clients.id;
        if (!acc[clientId]) {
          acc[clientId] = {
            id: clientId,
            name: curr.clients.name,
            totalIncome: 0,
            receivedIncome: 0,
            pendingIncome: 0,
          };
        }
        if (curr.type === 'income') {
          acc[clientId].totalIncome += curr.amount;
          if (curr.status === 'paid') acc[clientId].receivedIncome += curr.amount;
          else acc[clientId].pendingIncome += curr.amount;
        }
        return acc;
      }, {});
      
      setData(Object.values(grouped));
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="animate-spin size-8 text-blue-500 mx-auto" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {data.length === 0 ? (
        <div className="col-span-full py-20 text-center text-zinc-500 bg-zinc-900/30 border border-white/5 rounded-2xl">
          Nenhum dado financeiro por cliente encontrado.
        </div>
      ) : (
        data.map(client => (
          <div key={client.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-4 hover:border-blue-500/30 transition-colors group">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
                    <Users size={18} />
                  </div>
                  <h4 className="text-white font-bold">{client.name}</h4>
               </div>
               <ArrowRight size={16} className="text-zinc-600 group-hover:text-white transition-colors cursor-pointer" />
            </div>

            <div className="space-y-1">
               <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-500">Progresso de Recebimento</span>
                  <span className="text-zinc-300 font-bold">
                    {Math.round((client.receivedIncome / client.totalIncome) * 100)}%
                  </span>
               </div>
               <Progress value={(client.receivedIncome / client.totalIncome) * 100} className="h-1.5 bg-zinc-800" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
               <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Total Gerado</span>
                  <span className="text-white font-bold">{formatCurrency(client.totalIncome)}</span>
               </div>
               <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Recebido</span>
                  <span className="text-emerald-500 font-bold">{formatCurrency(client.receivedIncome)}</span>
               </div>
            </div>

            {client.pendingIncome > 0 && (
               <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs text-blue-400">Pendente</span>
                  <span className="text-sm font-bold text-blue-300">{formatCurrency(client.pendingIncome)}</span>
               </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

