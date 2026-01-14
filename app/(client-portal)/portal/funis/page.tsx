"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Filter, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";

interface Funnel {
  id: string;
  name: string;
  client_id: string;
  created_at: string;
}

export default function FunnelsListPage() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFunnels() {
      const { data } = await supabase.from('funnels').select('*');
      setFunnels(data || []);
      setLoading(false);
    }
    loadFunnels();
  }, []);

  if (loading) return <div className="p-8 text-zinc-500 animate-pulse">Carregando funis...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Funis de Vendas</h1>
          <p className="text-zinc-500 mt-1">Desenhe e analise a jornada de conversão dos seus clientes.</p>
        </div>
        <Link href="/portal/funis/novo">
            <Button className="bg-primary-500 hover:bg-primary-600 text-black font-bold gap-2">
                <Plus size={18} /> Criar Novo Funil
            </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {funnels.length > 0 ? funnels.map((funnel) => (
          <FunnelCard key={funnel.id} funnel={funnel} />
        )) : (
          <Card className="col-span-full border-dashed border-white/5 bg-transparent p-12 text-center">
            <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-white/5 text-zinc-600">
                    <Activity size={48} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Nenhum funil encontrado</h3>
                    <p className="text-zinc-500 max-w-xs mx-auto mt-2">Comece desenhando sua primeira jornada de vendas para visualizar as taxas de conversão.</p>
                </div>
                <Link href="/portal/funis/novo">
                    <Button variant="outline" className="border-white/10 hover:bg-white/5 mt-4">
                        Criar meu primeiro funil
                    </Button>
                </Link>
            </div>
          </Card>
        )}
        
        {/* Placeholder Demo Funnel if empty */}
        {funnels.length === 0 && (
            <FunnelCard 
                funnel={{ 
                    id: 'demo', 
                    name: 'Funel de Escala - Demo', 
                    client_id: 'demo',
                    created_at: new Date().toISOString() 
                }} 
                isDemo 
            />
        )}
      </div>
    </div>
  );
}

function FunnelCard({ funnel, isDemo = false }: { funnel: Funnel; isDemo?: boolean }) {
  return (
    <Card className="bg-zinc-900/50 border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="p-6">
        <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-primary-500/10 text-primary-500">
                <Filter size={20} />
            </div>
            {isDemo && <Badge variant="outline" className="text-[10px] text-zinc-500 border-white/10">DEMO</Badge>}
        </div>
        <CardTitle className="text-xl font-bold text-white group-hover:text-primary-500 transition-colors uppercase tracking-tight">
            {funnel.name}
        </CardTitle>
        <p className="text-xs text-zinc-500 mt-2">
            Criado em {format(new Date(funnel.created_at), 'dd/MM/yyyy')}
        </p>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-4 text-zinc-400">
            <div className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-emerald-500" />
                <span className="text-xs font-bold text-white">8.5% Conv.</span>
            </div>
        </div>
        <Link href={`/portal/funis/${funnel.id}`}>
            <Button size="sm" variant="ghost" className="text-primary-500 hover:text-primary-400 hover:bg-primary-500/5 gap-2">
                Visualizar <ArrowRight size={14} />
            </Button>
        </Link>
      </CardContent>
    </Card>
  );
}


