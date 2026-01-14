"use client";

import { Modal } from "@/components/ui/modal";
import { useState } from "react";
import { Package, DollarSign, Lightbulb } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useModal } from "@/contexts/modal-context";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceSchema, ServiceFormValues } from "@/lib/schemas/service";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { ServiceSuggestionsModal, type Suggestion } from "./service-suggestions-modal";

interface NewServiceModalProps {
    initialValues?: Partial<ServiceFormValues>;
}

export function NewServiceModal({ initialValues }: NewServiceModalProps) {
  const { closeModal, openModal } = useModal();
  const [loading, setLoading] = useState(false);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      price: initialValues?.price || 0,
      category: initialValues?.category || "",
      isRecurring: initialValues?.isRecurring || false,
      recurringPeriod: initialValues?.recurringPeriod || undefined, 
      showPublic: initialValues?.showPublic ?? true,
      showLeadForm: initialValues?.showLeadForm ?? true,
    }
  });

  const { register, control, handleSubmit, setValue, formState: { errors }, watch } = form; // Added watch here if needed
  const isRecurring = useWatch({ control, name: "isRecurring" });

  const handleOpenSuggestions = () => {
      openModal(
          <ServiceSuggestionsModal 
            onSelect={(suggestion: Suggestion) => {
                // Re-open this modal with suggestion data
                setTimeout(() => openModal(<NewServiceModal initialValues={{
                    name: suggestion.name,
                    description: suggestion.description,
                    price: suggestion.price,
                    category: suggestion.category,
                    isRecurring: suggestion.isRecurring,
                    recurringPeriod: suggestion.recurringPeriod,
                }} />), 100); 
            }}
            onBack={() => openModal(<NewServiceModal initialValues={form.getValues()} />)}
          />
      )
  };

  async function onSubmit(data: ServiceFormValues) {
    setLoading(true);
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
        alert("Usuário não logado");
        setLoading(false);
        return;
    }

    const { error } = await supabase.from('services').insert([{
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        is_recurring: data.isRecurring || false,
        recurring_period: data.isRecurring ? data.recurringPeriod : null,
        show_public: data.showPublic ?? true,
        show_lead_form: data.showLeadForm ?? true,
        created_at: new Date().toISOString(),
        user_id: user.data.user.id
    }]);

    setLoading(false);
    if (!error) {
        closeModal();
        window.location.reload(); 
    } else {
        alert('Erro ao criar serviço');
        console.error(error);
    }
  }

  return (
    <Modal title="Cadastrar Novo Serviço">
      <div className="space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar p-1">
        
        {/* Suggestion Banner */}
        <button 
            type="button"
            onClick={handleOpenSuggestions}
            className="w-full flex items-center gap-2 text-primary-500 font-medium text-sm hover:text-primary-600 transition-colors mb-4"
        >
            <Lightbulb size={16} />
            Sugestões de Serviços
        </button>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Name */}
            <div className="space-y-2">
                <Label className="uppercase text-xs font-bold text-zinc-500 tracking-wide">Nome do Serviço</Label>
                <div className="relative">
                    <Input 
                        placeholder="Ex: Logo Design" 
                        {...register("name")} 
                        className="bg-zinc-950 border-white/10 pl-10" 
                    />
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                </div>
                {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label className="uppercase text-xs font-bold text-zinc-500 tracking-wide">Descrição</Label>
                <textarea 
                    {...register("description")}
                    placeholder="Descreva o que está incluso no serviço"
                    rows={4}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary-500/50 transition-all placeholder:text-zinc-600 resize-none text-sm"
                />
                {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
            </div>

            {/* Price & Category */}
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold text-zinc-500 tracking-wide">Preço (R$)</Label>
                     <div className="relative">
                        <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0,00" 
                            {...register("price", { valueAsNumber: true })} 
                            className="bg-zinc-950 border-white/10 pl-10" 
                        />
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        {isRecurring && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium bg-zinc-900 px-2 py-1 rounded">
                                /{form.watch("recurringPeriod") === 'Mensal' ? 'mês' : 
                                  form.watch("recurringPeriod") === 'Anual' ? 'ano' : 
                                  form.watch("recurringPeriod")?.toLowerCase() || 'período'}
                            </div>
                        )}
                    </div>
                    {errors.price && <span className="text-red-500 text-xs">{errors.price.message}</span>}
                 </div>
                 <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold text-zinc-500 tracking-wide">Categoria</Label>
                    <select 
                        {...register("category")}
                        className="w-full h-10 bg-zinc-950 border border-white/10 rounded-md px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background"
                    >
                        <option value="">Selecione</option>
                        <option value="Design">Design</option>
                        <option value="Tráfego Pago">Tráfego Pago</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Consultoria">Consultoria</option>
                        <option value="Development">Desenvolvimento</option>
                    </select>
                    {errors.category && <span className="text-red-500 text-xs">{errors.category.message}</span>}
                 </div>
            </div>

            {/* Recurring Toggle */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-sm font-medium text-white">Serviço Recorrente</Label>
                        <p className="text-xs text-zinc-400">Cobrança mensal, trimestral ou anual</p>
                    </div>
                    <Controller
                        control={control}
                        name="isRecurring"
                        render={({ field }) => (
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        )}
                    />
                </div>
                
                {isRecurring && (
                    <div className="pt-2 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                        <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2 block">Período</Label>
                        <select 
                            {...register("recurringPeriod")}
                            className="w-full h-10 bg-zinc-950 border border-white/10 rounded-md px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background"
                        >
                            <option value="">Selecione</option>
                            <option value="Mensal">Mensal</option>
                            <option value="Trimestral">Trimestral</option>
                            <option value="Semestral">Semestral</option>
                            <option value="Anual">Anual</option>
                        </select>
                        {errors.recurringPeriod && <span className="text-red-500 text-xs">{errors.recurringPeriod.message}</span>}
                    </div>
                )}
            </div>

            {/* Visibility Toggles */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-sm font-medium text-white">Exibir na Página Pública</Label>
                        <p className="text-xs text-zinc-400">Mostrar este serviço na sua landing page/portfólio</p>
                    </div>
                    <Controller
                        control={control}
                        name="showPublic"
                        render={({ field }) => (
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        )}
                    />
                </div>
                
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-sm font-medium text-white">Exibir no Formulário de Leads</Label>
                        <p className="text-xs text-zinc-400">Disponibilizar como opção no formulário de captação</p>
                    </div>
                    <Controller
                        control={control}
                        name="showLeadForm"
                        render={({ field }) => (
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        )}
                    />
                </div>
            </div>

            {/* Footer Actions */}
            <div className="grid grid-cols-2 gap-4 pt-4 mt-6 border-t border-white/10">
                 <Button type="button" variant="ghost" onClick={handleOpenSuggestions} className="h-12 border border-white/10 text-white hover:bg-white/5">
                     Ver Sugestões
                 </Button>
                  <Button type="submit" disabled={loading} className="h-12 bg-linear-to-r from-primary-500 to-emerald-600 hover:opacity-90 text-black font-bold">
                      {loading ? <Loader2 className="animate-spin" /> : 'Cadastrar Novo Serviço'}
                  </Button>
            </div>

        </form>
      </div>
    </Modal>
  );
}
