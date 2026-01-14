"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModal } from "@/contexts/modal-context";
import { useState } from "react";
import { toast } from "sonner";
import { GripVertical, Trash2, Plus } from "lucide-react";

const INITIAL_STAGES = [
  { id: "new", title: "Novo Lead" },
  { id: "contact", title: "Primeiro Contato" },
  { id: "proposal", title: "Proposta Enviada" },
  { id: "negotiation", title: "Em Negociação" },
  { id: "won", title: "Fechado Ganho" },
];

export function PipelineStepsModal() {
  const { closeModal } = useModal();
  const [stages, setStages] = useState(INITIAL_STAGES);
  const [newStage, setNewStage] = useState("");

  const handleAddStage = () => {
    if (!newStage.trim()) return;
    setStages([...stages, { id: `custom-${Date.now()}`, title: newStage }]);
    setNewStage("");
  };

  const handleRemoveStage = (id: string) => {
    setStages(stages.filter(s => s.id !== id));
  };

  const handleSave = () => {
    // Here we would save to Supabase or global store
    toast.success("Etapas atualizadas com sucesso!");
    closeModal();
  };

  return (
    <Modal title="Configurar Etapas do Pipeline">
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Gerencie as colunas do seu pipeline de vendas. Arraste para reordenar.
        </p>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {stages.map((stage) => (
                <div key={stage.id} className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-lg border border-white/5 group">
                    <GripVertical className="text-zinc-600 cursor-grab" size={20} />
                    <Input 
                        value={stage.title} 
                        onChange={(e) => setStages(stages.map(s => s.id === stage.id ? {...s, title: e.target.value} : s))}
                        className="bg-transparent border-0 h-auto p-0 focus-visible:ring-0" 
                    />
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveStage(stage.id)}
                        className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            ))}
        </div>

        <div className="flex gap-2 pt-2">
            <Input 
                placeholder="Nome da nova etapa..." 
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                className="bg-zinc-950 border-white/10"
            />
            <Button onClick={handleAddStage} variant="secondary">
                <Plus size={16} />
            </Button>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-4">
          <Button variant="outline" onClick={closeModal}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-primary text-black hover:bg-primary/90">
            Salvar Alterações
          </Button>
        </div>
      </div>
    </Modal>
  );
}
