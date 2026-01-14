"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Receivable {
  id: string;
  description: string;
  amount: number;
  category: string;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  clients?: {
    name: string;
  };
}

interface ReceivablesViewProps {
  month: Date;
}

export function ReceivablesView({ month }: ReceivablesViewProps) {
  const [data, setData] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).toISOString();
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString();

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*, clients(name)')
      .eq('type', 'income')
      .gte('due_date', firstDay)
      .lte('due_date', lastDay)
      .order('due_date', { ascending: true });

    setData((transactions as Receivable[]) || []);
    setLoading(false);
  }, [month]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="animate-spin size-8 text-emerald-500 mx-auto" />
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-x-auto custom-scrollbar mt-6">
      <Table className="min-w-[700px] sm:min-w-full">
        <TableHeader className="bg-zinc-900/50">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-zinc-400 font-bold">Cliente / Descrição</TableHead>
            <TableHead className="text-zinc-400 font-bold">Categoria</TableHead>
            <TableHead className="text-zinc-400 font-bold">Vencimento</TableHead>
            <TableHead className="text-zinc-400 font-bold">Status</TableHead>
            <TableHead className="text-zinc-400 font-bold text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-20 text-zinc-500">
                Nenhuma conta a receber encontrada.
              </TableCell>
            </TableRow>
          ) : (
            data.map(t => (
              <TableRow key={t.id} className="border-white/5 hover:bg-white/2 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-zinc-200 font-medium">{t.clients?.name || "Cliente Avulso"}</span>
                    <span className="text-xs text-zinc-500">{t.description}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-zinc-800 border-white/5 text-zinc-400 text-[10px] uppercase">
                    {t.category || "Serviço"}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-400 text-sm">
                  {new Date(t.due_date).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <Badge className={cn(
                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded-md",
                    t.status === 'paid' ? "bg-emerald-500/10 text-emerald-500" :
                    t.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                    "bg-rose-500/10 text-rose-500"
                  )}>
                    {t.status === 'paid' ? "Recebido" : 
                     t.status === 'pending' ? "Pendente" : "Atrasado"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-bold text-emerald-500">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
