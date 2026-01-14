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

export function NewDealModal() {
  const router = useRouter();
  const { closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    value: "",
    client_name: "",
    stage: "new",
    priority: "medium",
    probability: "50",
  });

  async function handleSubmit() {
    if (!formData.title || !formData.value) {
      toast.error("Por favor, preencha o título e o valor.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('deals').insert([{
          title: formData.title,
          value: parseFloat(formData.value),
          client_name: formData.client_name || "Cliente Desconhecido",
          stage: formData.stage,
          priority: formData.priority,
          probability: parseInt(formData.probability),
      }]);

      if (error) throw error;

      toast.success("Oportunidade criada com sucesso!");
      router.refresh();
      window.location.reload(); // Force reload to ensure board updates if SWR/hooks aren't perfect
      closeModal();
    } catch (error) {
      toast.error('Erro ao criar oportunidade');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Nova Oportunidade">
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground -mt-4 mb-4">
            Adicione um novo lead ao seu pipeline de vendas.
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
                onValueChange={(val) => setFormData({ ...formData, priority: val })}
            >
                <SelectTrigger className="bg-zinc-950/50">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={closeModal} disabled={loading}>
                Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {loading ? "Criando..." : "Criar Oportunidade"}
            </Button>
        </div>
      </div>
    </Modal>
  );
}
