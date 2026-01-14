"use client";

import { Modal } from "@/components/ui/modal";
import { useState } from "react";
import { DollarSign, User, Tag, Percent } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useModal } from "@/contexts/modal-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Deal } from "@/components/pipeline/deal-card";

interface EditDealModalProps {
  deal: Deal;
}

export function EditDealModal({ deal }: EditDealModalProps) {
  const router = useRouter();
  const { closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  
  interface FormData {
    title: string;
    value: string;
    client_name: string;
    stage: string;
    priority: "low" | "medium" | "high";
    probability: string;
  }

  const [formData, setFormData] = useState<FormData>({
    title: deal.title,
    value: deal.value.toString(),
    client_name: deal.client_name,
    stage: deal.stage,
    priority: (deal.priority as "low" | "medium" | "high") || "medium",
    probability: (deal.probability || 50).toString(),
  });

  async function handleSubmit() {
    if (!formData.title || !formData.value) {
      toast.error("Por favor, preencha o título e o valor.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('deals')
        .update({
          title: formData.title,
          value: parseFloat(formData.value),
          client_name: formData.client_name || "Cliente Desconhecido",
          stage: formData.stage,
          priority: formData.priority,
          probability: parseInt(formData.probability),
        })
        .eq('id', deal.id);

      if (error) throw error;

      toast.success("Oportunidade atualizada com sucesso!");
      router.refresh();
      window.location.reload(); 
      closeModal();
    } catch (error) {
      toast.error('Erro ao atualizar oportunidade');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Editar Oportunidade">
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground -mt-4 mb-4">
            Atualize as informações do seu deal.
        </p>

        {/* Title */}
        <div className="space-y-2">
            <Label>Título do Deal *</Label>
            <Input 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Consultoria de Marketing"
                className="bg-zinc-950/50"
            />
        </div>

        {/* Client */}
        <div className="space-y-2">
            <Label>Nome do Cliente</Label>
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input 
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder="Nome do cliente ou empresa"
                    className="pl-10 bg-zinc-950/50"
                />
            </div>
        </div>

        {/* Value and Probability */}
        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>Valor do Deal *</Label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input 
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="0.00"
                        className="pl-10 bg-zinc-950/50"
                    />
                </div>
             </div>
             <div className="space-y-2">
                <Label>Probabilidade (%)</Label>
                <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input 
                        type="number"
                        min="0"
                        max="100"
                        value={formData.probability}
                        onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                        className="pl-10 bg-zinc-950/50"
                    />
                </div>
             </div>
        </div>

        {/* Priority */}
        <div className="space-y-2">
            <Label>Prioridade</Label>
            <Select 
                value={formData.priority}
                onValueChange={(val: "low" | "medium" | "high") => setFormData({ ...formData, priority: val })}
            >
                <SelectTrigger className="bg-zinc-950/50">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={closeModal} disabled={loading}>
                Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
        </div>
      </div>
    </Modal>
  );
}
