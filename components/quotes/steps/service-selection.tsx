"use client";

import { UseFormReturn, useFieldArray, FieldValues } from "react-hook-form";
import { Quote } from "@/lib/schemas/quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ServiceSelectionProps {
  form: UseFormReturn<FieldValues>;
}

export function ServiceSelection({ form }: ServiceSelectionProps) {
  const { register, control, watch, setValue } = form as unknown as UseFormReturn<Quote>;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "itens",
  });

  interface Service {
      id: string;
      name: string;
      price: number;
      description?: string;
  }
  const [services, setServices] = useState<Service[]>([]);
  const watchedItems = watch("itens");
  const discount = watch("desconto");

  useEffect(() => {
    async function fetchServices() {
        const { data } = await supabase.from('services').select('*');
        if (data) setServices(data);
    }
    fetchServices();
  }, []);

  // Calculate totals
  useEffect(() => {
       const currentItems = watchedItems || [];
       const subtotal = currentItems.reduce((acc, item) => {
           const qtd = Number(item.quantidade) || 0;
           const price = Number(item.valor_unitario) || 0;
           return acc + (qtd * price);
       }, 0);
       
       const safeDiscount = Number(discount) || 0;
       
       // Use a timeout to avoid update loops if necessary, or just set strictly
       // Checking if values changed to avoid infinite loops if setValue triggers watch
       // But setValue("subtotal") shouldn't affect watchedItems ("itens") validation
       setValue("subtotal", subtotal);
       setValue("total", subtotal - safeDiscount);
  }, [watchedItems, discount, setValue]);

  const handleServiceSelect = (index: number, serviceId: string) => {
      const service = services.find(s => s.id === serviceId);
      if (service) {
          setValue(`itens.${index}.nome_item`, service.name, { shouldValidate: true, shouldDirty: true });
          setValue(`itens.${index}.descricao`, service.description || "", { shouldValidate: true, shouldDirty: true });
          setValue(`itens.${index}.valor_unitario`, service.price, { shouldValidate: true, shouldDirty: true });
          setValue(`itens.${index}.servico_id`, service.id, { shouldValidate: true, shouldDirty: true });
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white tracking-tight">Itens do Orçamento</h3>
            <Button 
                type="button" 
                onClick={() => append({ nome_item: "", quantidade: 1, valor_unitario: 0, descricao: "" })}
                className="bg-primary-500 hover:bg-primary-600 text-black font-semibold shadow-[0_0_15px_rgba(121,205,37,0.3)] border-none transition-all hover:scale-105 active:scale-95"
            >
                <Plus size={16} className="mr-2" /> Adicionar Item
            </Button>
        </div>

        <div className="space-y-2">
            {/* Header da Tabela (Desktop) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                <div className="col-span-4">Item / Serviço</div>
                <div className="col-span-4">Descrição (Opcional)</div>
                <div className="col-span-1 text-center">Qtd</div>
                <div className="col-span-2 text-right">Valor Unit.</div>
                <div className="col-span-1"></div>
            </div>

            <div className="space-y-3">
                {fields.map((field, index) => (
                    <div key={field.id} className="group relative grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-zinc-900/40 hover:bg-zinc-900/60 rounded-xl border border-white/5 transition-all duration-200 shadow-sm hover:shadow-md hover:border-primary-500/20 items-start">
                        
                        <div className="col-span-1 md:col-span-4 space-y-2">
                            <label className="md:hidden text-xs text-zinc-500">Item</label>
                             <select 
                                className="w-full h-9 rounded-md border border-white/10 bg-black/40 px-3 text-xs text-zinc-300 focus:border-primary-500/50 outline-none transition-colors"
                                onChange={(e) => handleServiceSelect(index, e.target.value)}
                             >
                                <option value="">★ Selecionar predefinição...</option>
                                {services.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>
                                ))}
                             </select>
                            <Input 
                                {...register(`itens.${index}.nome_item` as const)}
                                placeholder="Nome do item ou serviço" 
                                className="bg-transparent border-transparent px-0 h-auto text-sm font-medium focus-visible:ring-0 placeholder:text-zinc-600"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-4">
                            <label className="md:hidden text-xs text-zinc-500">Descrição</label>
                            <Input 
                                {...register(`itens.${index}.descricao` as const)}
                                placeholder="Detalhes do item..." 
                                className="bg-transparent border-white/5 text-xs text-zinc-400 focus-visible:ring-0 placeholder:text-zinc-700 h-9"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-1">
                            <label className="md:hidden text-xs text-zinc-500">Qtd</label>
                             <Input 
                                type="number"
                                min={1}
                                {...register(`itens.${index}.quantidade` as const, { valueAsNumber: true })}
                                className="bg-black/20 border-white/10 text-center text-sm focus:border-primary-500/50"
                            />
                        </div>

                         <div className="col-span-1 md:col-span-2">
                            <label className="md:hidden text-xs text-zinc-500">Valor</label>
                             <div className="relative">
                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">R$</span>
                                 <Input 
                                    type="number" step="0.01"
                                    {...register(`itens.${index}.valor_unitario` as const, { valueAsNumber: true })}
                                    className="bg-black/20 border-white/10 text-right pr-3 pl-8 text-sm focus:border-primary-500/50 font-mono"
                                />
                             </div>
                        </div>

                         <div className="col-span-1 md:col-span-1 flex justify-end items-center h-full">
                            <Button 
                                type="button" 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => remove(index)}
                                className="text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-colors w-8 h-8 rounded-full"
                            >
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {fields.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                    <p className="text-zinc-500 text-sm">Nenhum item adicionado ao orçamento.</p>
                    <Button 
                        variant="link" 
                        onClick={() => append({ nome_item: "Novo Item", quantidade: 1, valor_unitario: 0, descricao: "" })} 
                        className="text-primary-500"
                    >
                        Clique para adicionar
                    </Button>
                </div>
            )}
        </div>

        <div className="flex flex-col items-end pt-6 border-t border-white/5 space-y-3">
            <div className="w-full max-w-xs space-y-3">
                <div className="flex justify-between items-center text-sm">
                     <span className="text-zinc-400">Subtotal:</span>
                     <span className="text-zinc-200 font-mono">
                         {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(watch("subtotal") || 0)}
                     </span>
                </div>
                
                 <div className="flex justify-between items-center text-sm">
                     <span className="text-zinc-400">Desconto:</span>
                     <div className="flex items-center gap-2 w-32">
                         <span className="text-zinc-600 text-xs">-</span>
                         <Input 
                            type="number"
                            placeholder="0,00"
                            className="bg-black/20 border-white/10 text-right h-8 text-xs font-mono focus:border-primary-500/50"
                            {...register("desconto", { valueAsNumber: true })}
                         />
                    </div>
                </div>

                <div className="h-px bg-white/10 my-2" />

                 <div className="flex justify-between items-center">
                     <span className="text-zinc-300 font-bold">Total Final:</span>
                     <span className="text-2xl font-bold text-primary-500 tracking-tight font-mono">
                         {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(watch("total") || 0)}
                     </span>
                </div>
            </div>
        </div>

    </div>
  );
}
