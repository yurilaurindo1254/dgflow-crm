"use client";

import { Modal } from "@/components/ui/modal";
import { useState, useEffect } from "react";
import { AlignLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useModal } from "@/contexts/modal-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Adicionamos a prop opcional
interface NewTaskModalProps {
    initialDate?: Date;
}

export function NewTaskModal({ initialDate }: NewTaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    client: "",
    responsible: "",
    // Se tiver data inicial, formata para YYYY-MM-DD, senão vazio
    dueDate: initialDate ? initialDate.toISOString().split('T')[0] : "",
    priority: "medium",
    tags: "",
  });
  const [clients, setClients] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const { closeModal } = useModal();

  useEffect(() => {
    supabase.from('clients').select('id, name').then(({ data }) => {
        if (data) setClients(data);
    });
  }, []);

  async function handleSubmit() {
    if (!formData.title) return alert("O título é obrigatório");
    
    setLoading(true);
    const { error } = await supabase.from('tasks').insert([{
        title: formData.title,
        description: formData.description,
        client_id: formData.client || null,
        due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        priority: formData.priority,
        tags: formData.tags ? [formData.tags] : [], // Garante array
        status: 'todo'
    }]);

    setLoading(false);
    if (!error) {
        closeModal();
        window.location.reload();
    } else {
        alert('Erro ao criar tarefa');
        console.error(error);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Modal title="Nova Tarefa">
      <div className="space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar p-1">
        
        {/* Title */}
        <div className="space-y-2">
            <Label>Título da Tarefa</Label>
            <Input 
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Criar posts Instagram"
                className="bg-zinc-950 border-primary-500 focus-visible:ring-primary-500"
            />
        </div>

        {/* Description */}
        <div className="space-y-2">
            <Label>Descrição</Label>
            <div className="relative">
                <textarea 
                    name="description"
                    placeholder="Descreva os detalhes da tarefa"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary-500/50 transition-all placeholder:text-zinc-600 resize-none pr-8 text-sm"
                />
                <AlignLeft className="absolute bottom-3 right-3 text-zinc-600" size={16} />
            </div>
        </div>

        {/* Client Selection */}
        <div className="space-y-2">
             <Label>Cliente (opcional)</Label>
             <div className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-zinc-400 mb-2">
                <select 
                    name="client" 
                    value={formData.client} 
                    onChange={handleChange}
                    className="w-full bg-transparent text-white focus:outline-none appearance-none text-sm"
                >
                    <option value="">Selecione um cliente...</option>
                    {clients.map(c => (
                        <option key={c.id} value={c.id} className="bg-zinc-900">{c.name}</option>
                    ))}
                </select>
             </div>
        </div>

        {/* Responsible & Deadline */}
        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>Responsável</Label>
                <div className="bg-zinc-950 border border-white/10 rounded-lg p-2.5 flex items-center justify-between text-zinc-500 cursor-not-allowed opacity-70">
                    <span className="text-sm">Eu (Admin)</span>
                </div>
             </div>
             <div className="space-y-2">
                <Label>Prazo</Label>
                <div className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between text-zinc-400">
                    <input 
                        type="date" 
                        name="dueDate" 
                        value={formData.dueDate} 
                        onChange={handleChange}
                        className="bg-transparent text-white focus:outline-none w-full text-sm" 
                    />
                </div>
             </div>
        </div>

        {/* Priority & Tags */}
        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>Prioridade</Label>
                <select 
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none appearance-none cursor-pointer"
                >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                </select>
             </div>
             <div className="space-y-2">
                <Label>Tags</Label>
                <Input 
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="design, urgente"
                    className="bg-zinc-950 border-white/10"
                />
             </div>
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-2 gap-4 pt-4 mt-6 border-t border-white/10">
             <Button variant="outline" onClick={closeModal} className="border-white/10 hover:bg-white/5">
                 Cancelar
             </Button>
              <Button onClick={handleSubmit} disabled={loading} className="bg-primary-500 hover:bg-primary-600 text-black font-bold">
                  {loading ? 'Salvando...' : 'Criar Tarefa'}
              </Button>
        </div>

      </div>
    </Modal>
  );
}
