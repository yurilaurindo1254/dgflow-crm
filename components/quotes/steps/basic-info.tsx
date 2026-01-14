"use client";

import { UseFormReturn, FieldValues } from "react-hook-form";
import { Quote } from "@/lib/schemas/quote";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface BasicInfoProps {
  form: UseFormReturn<FieldValues>;
}

interface Client {
    id: string;
    name: string;
}

export function BasicInfo({ form }: BasicInfoProps) {
  const { register, formState: { errors } } = form as unknown as UseFormReturn<Quote>;
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    async function fetchClients() {
      const { data } = await supabase.from('clients').select('id, name');
      if (data) setClients(data);
    }
    fetchClients();
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Título do Orçamento</Label>
        <Input 
          {...register("titulo")} 
          placeholder="Ex: Identidade Visual - Empresa X"
          className="bg-zinc-900 border-white/10"
        />
        {errors.titulo && <p className="text-red-500 text-xs">{errors.titulo.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label>Cliente</Label>
        <select 
          {...register("cliente_id")}
          className="w-full h-10 rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
            <option value="">Selecione um cliente...</option>
            {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
            ))}
        </select>
        {errors.cliente_id && <p className="text-red-500 text-xs">{errors.cliente_id.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label>Descrição (Opcional)</Label>
        <textarea 
          {...register("descricao")}
          className="w-full min-h-[100px] rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Detalhes adicionais do projeto..."
        />
      </div>
    </div>
  );
}
