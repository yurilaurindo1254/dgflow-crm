"use client";

import { useState } from "react";
import { 
  Edit, 
  Send, 
  CheckCircle, 
  Eye, 
  Copy, 
  FileText, 
  Archive, 
  Trash2,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface QuoteActionsProps {
  quoteId: string;
  status: string; // 'draft' | 'sent' | 'approved' | 'rejected'
  onUpdate?: () => void; // Callback para atualizar a lista pai
}

export function QuoteActions({ quoteId, status, onUpdate }: QuoteActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Função Genérica para alterar Status
  const updateStatus = async (newStatus: string, successMessage: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('orcamentos')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', quoteId);

      if (error) throw error;

      alert(successMessage);
      if (onUpdate) onUpdate();
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Erro ao atualizar status");
    } finally {
      setLoading(false);
    }
  };

  // 1. Editar
  const handleEdit = () => {
    if (status === 'approved') {
      const confirm = window.confirm("Editar um orçamento aprovado removerá a aprovação. Continuar?");
      if (!confirm) return;
    }
    router.push(`/orcamentos/${quoteId}/editar`);
  };

  // 2. Concluir e Enviar (Simulado + Status Update)
  const handleSend = async () => {
    // Aqui você integraria com sua API de email
    // Por enquanto, atualizamos o status para 'sent'
    await updateStatus('sent', "Orçamento marcado como enviado!");
  };

  // 4. Aprovar Manualmente (+ Gerar Contrato Trigger)
  const handleApprove = async () => {
    setLoading(true);
    try {
        // 1. Aprova o orçamento
        const { error: quoteError } = await supabase
            .from('orcamentos')
            .update({ status: 'approved', approved_at: new Date().toISOString() })
            .eq('id', quoteId);
        
        if (quoteError) throw quoteError;

        // 2. Tenta criar o contrato (exemplo simplificado)
        // Isso normalmente chamaria uma API Route para gerar o PDF/Registro
        const { error: contractError } = await supabase
            .from('contracts')
            .insert({ quote_id: quoteId, status: 'draft', content: 'Contrato gerado automaticamente...' });

        if (!contractError) {
            alert("Orçamento aprovado e Contrato gerado!");
        } else {
            console.error(contractError);
            alert("Orçamento aprovado, mas erro ao gerar contrato.");
        }
        
        if (onUpdate) onUpdate();
        router.refresh();
    } catch (e) {
        console.error(e);
        alert("Erro ao aprovar orçamento");
    } finally {
        setLoading(false);
    }
  };

  // 7. Copiar Link
  const handleCopyLink = () => {
    const url = `${window.location.origin}/proposta/${quoteId}`;
    navigator.clipboard.writeText(url);
    alert("Link copiado para a área de transferência");
  };

  // 11. Excluir
  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir este orçamento?")) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('orcamentos')
        .delete()
        .eq('id', quoteId);

      if (error) throw error;
      
      alert("Orçamento excluído");
      if (onUpdate) onUpdate();
      router.refresh();
    } catch (e) {
        console.error(e);
        alert("Erro ao excluir");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10" disabled={loading}>
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4 text-zinc-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800 text-zinc-200">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        
        {/* Edição */}
        <DropdownMenuItem onClick={handleEdit} className="cursor-pointer hover:bg-white/5 hover:text-white">
          <Edit className="mr-2 h-4 w-4" />
          <span>Editar</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        {/* Fluxo de Envio/Aprovação */}
        <DropdownMenuItem onClick={handleSend} disabled={status === 'approved'} className="cursor-pointer hover:bg-white/5 hover:text-white">
          <Send className="mr-2 h-4 w-4" />
          <span>Concluir e Enviar</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleApprove} className="cursor-pointer hover:bg-white/5 hover:text-emerald-500">
          <CheckCircle className="mr-2 h-4 w-4" />
          <span>Aprovar Manualmente</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        {/* Visualização */}
        <DropdownMenuItem onClick={() => window.open(`/proposta/${quoteId}`, '_blank')} className="cursor-pointer hover:bg-white/5 hover:text-white">
          <Eye className="mr-2 h-4 w-4" />
          <span>Visualizar</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer hover:bg-white/5 hover:text-white">
          <Copy className="mr-2 h-4 w-4" />
          <span>Copiar Link</span>
        </DropdownMenuItem>

        {/* Gerar Contrato (Ação explícita) */}
        <DropdownMenuItem className="cursor-pointer hover:bg-white/5 hover:text-white">
          <FileText className="mr-2 h-4 w-4" />
          <span>Gerar Contrato</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        {/* Ações Destrutivas */}
        <DropdownMenuItem className="cursor-pointer hover:bg-white/5 hover:text-white">
          <Archive className="mr-2 h-4 w-4" />
          <span>Arquivar</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-500 hover:text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Excluir</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
