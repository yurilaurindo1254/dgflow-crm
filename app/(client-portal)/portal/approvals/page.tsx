"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Edit, FileText, MessageSquare, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ApprovalItem {
  id: string;
  title: string;
  updated_at?: string;
  created_at: string;
}

export default function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustmentComment, setAdjustmentComment] = useState("");
  const [activeItem, setActiveItem] = useState<string | null>(null);

  useEffect(() => {
    async function loadApprovals() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('client_id')
          .eq('id', user.id)
          .single();

        if (profile?.client_id) {
          const { data } = await supabase
            .from('tasks')
            .select('*')
            .eq('client_id', profile.client_id)
            .eq('status_approval', 'waiting_approval'); 
          
          setItems(data || []);
        }
      } catch (err) {
        console.error("Error loading approvals:", err);
      } finally {
        setLoading(false);
      }
    }
    loadApprovals();
  }, []);

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status_approval: 'approved' })
      .eq('id', id);
    
    if (!error) {
      setItems(items.filter(i => i.id !== id));
      alert("Item aprovado com sucesso!");
    }
  };

  const handleAdjust = async (id: string) => {
    if (!adjustmentComment.trim()) {
      alert("Por favor, descreva o ajuste necessário.");
      return;
    }
    
    const { error } = await supabase
      .from('tasks')
      .update({ 
        status_approval: 'adjustment_requested',
        feedback_client: adjustmentComment 
      })
      .eq('id', id);

    if (!error) {
       await supabase.from('task_activities').insert({
         task_id: id,
         action_type: 'feedback',
         details: `Cliente solicitou ajustes: ${adjustmentComment}`
       });

      setItems(items.filter(i => i.id !== id));
      setActiveItem(null);
      setAdjustmentComment("");
      alert("Solicitação de ajuste enviada.");
    }
  };

  if (loading) return <div className="p-8 text-zinc-500 animate-pulse">Carregando aprovações...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Central de Aprovações</h1>
        <p className="text-zinc-500 mt-1">Revise e aprove os materiais produzidos pela agência.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.length > 0 ? items.map((item) => (
          <Card key={item.id} className="bg-zinc-900/50 border-white/5 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500 shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                       <Badge className="bg-yellow-500/10 text-yellow-500 border-none text-[10px]">Aguardando</Badge>
                    </div>
                    <p className="text-sm text-zinc-500 mt-1">
                      Enviado para revisão em {new Date(item.updated_at || item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => handleApprove(item.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 border-none shadow-lg shadow-emerald-900/20"
                  >
                    <Check className="mr-2 size-4" /> Aprovar
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveItem(activeItem === item.id ? null : item.id)}
                    className="border-white/10 hover:bg-white/5 text-zinc-300"
                  >
                    <Edit className="mr-2 size-4" /> Solicitar Ajuste
                  </Button>
                </div>
              </div>

              {activeItem === item.id && (
                <div className="mt-6 pt-6 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                    <MessageSquare size={14} /> Descreva os ajustes necessários:
                  </label>
                  <Textarea 
                    value={adjustmentComment}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdjustmentComment(e.target.value)}
                    placeholder="Ex: Mudar a cor do botão, ajustar o texto etc..."
                    className="bg-zinc-900 border-white/10 text-white min-h-[100px] focus:ring-primary-500"
                  />
                  <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setActiveItem(null)} className="text-zinc-500">Cancelar</Button>
                    <Button 
                      onClick={() => handleAdjust(item.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                      Enviar Solicitação
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )) : (
          <div className="bg-zinc-900/30 border border-dashed border-white/5 rounded-2xl p-16 text-center">
            <div className="size-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4 text-zinc-700">
               <CheckCircle2 size={32} />
            </div>
            <h3 className="text-white font-semibold">Tudo em dia!</h3>
            <p className="text-zinc-600 mt-1">Não há itens aguardando aprovação no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}

