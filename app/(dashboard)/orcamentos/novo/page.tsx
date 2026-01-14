"use client";

import { useState } from "react";
import { useForm, UseFormReturn, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quoteSchema, Quote } from "@/lib/schemas/quote";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Steps
import { BasicInfo } from "@/components/quotes/steps/basic-info";
import { ServiceSelection } from "@/components/quotes/steps/service-selection";
import { PaymentConditions } from "@/components/quotes/steps/payment-conditions";
import { Review } from "@/components/quotes/steps/review";

const STEPS = [
    { number: 1, title: "Informações Básicas" },
    { number: 2, title: "Itens do Orçamento" },
    { number: 3, title: "Pagamento e Branding" },
    { number: 4, title: "Revisão Final" },
];

export default function NewQuotePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
        titulo: "",
        descricao: "",
        status: "rascunho",
        subtotal: 0,
        desconto: 0,
        total: 0,
        cor_primaria: "#EC4899",
        cor_secundaria: "#A855F7",
        itens: [],
        cliente_id: "",
        data_validade: "",
        prazo_entrega: "",
        forma_pagamento_config: {
            tipo: "pix",
            entrada: 0,
            parcelas: 1
        }
    } as unknown as Quote // Explicit cast to satisfy strict resolver type matching for defaults
  });

  const { trigger, handleSubmit } = form;

  const nextStep = async () => {
      let valid = false;
      if (currentStep === 1) valid = await trigger(["titulo", "cliente_id"]);
      if (currentStep === 2) valid = true; // Items validation handled generally or in review
      if (currentStep === 3) valid = await trigger(["prazo_entrega", "data_validade"]);
      
      if (valid) setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = async (data: Quote) => {
      setLoading(true);
      try {
          // 1. Get User
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");

          // 2. Create Quote
          const { data: quote, error: quoteError } = await supabase
              .from('orcamentos')
              .insert({
                  user_id: user.id,
                  cliente_id: data.cliente_id,
                  titulo: data.titulo,
                  descricao: data.descricao,
                  status: data.status,
                  data_validade: data.data_validade,
                  prazo_entrega: data.prazo_entrega,
                  subtotal: data.subtotal,
                  desconto: data.desconto,
                  total: data.total,
                  cor_primaria: data.cor_primaria,
                  cor_secundaria: data.cor_secundaria,
                  // forma_pagamento_config could be mapped here if needed
              })
              .select()
              .single();

          if (quoteError) throw quoteError;

          // 2. Create Items
          if (data.itens && data.itens.length > 0) {
              const itemsToInsert = data.itens.map(item => ({
                  orcamento_id: quote.id,
                  servico_id: item.servico_id || null, // Ensure explicit null if undefined
                  nome_item: item.nome_item,
                  descricao: item.descricao,
                  quantidade: item.quantidade,
                  valor_unitario: item.valor_unitario,
                  valor_total: item.valor_total || (item.quantidade * item.valor_unitario)
              }));

              const { error: itemsError } = await supabase
                  .from('itens_orcamento')
                  .insert(itemsToInsert);
              
              if (itemsError) throw itemsError;
          }

          router.push("/orcamentos");
          router.refresh();

      } catch (error) {
          console.error("Error creating quote:", JSON.stringify(error, null, 2));
          alert(`Erro ao criar orçamento: ${JSON.stringify(error)}`);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Novo Orçamento</h1>
            <div className="text-sm text-zinc-400">Passo {currentStep} de 4</div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-800 -translate-y-1/2 rounded-full" />
            <div 
                className="absolute top-1/2 left-0 h-1 bg-primary-500 -translate-y-1/2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
            <div className="relative flex justify-between">
                {STEPS.map((step) => (
                    <div key={step.number} className="flex flex-col items-center gap-2">
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 border-2 transition-colors
                            ${step.number <= currentStep ? 'bg-zinc-950 border-primary-500 text-primary-500' : 'bg-zinc-900 border-zinc-700 text-zinc-500'}
                        `}>
                            {step.number}
                        </div>
                        <span className={`text-xs font-medium ${step.number <= currentStep ? 'text-white' : 'text-zinc-600'}`}>
                            {step.title}
                        </span>
                    </div>
                ))}
            </div>
        </div>

        {/* Form Content */}
        <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-6 min-h-[400px]">
            {currentStep === 1 && <BasicInfo form={form as unknown as UseFormReturn<FieldValues>} />}
            {currentStep === 2 && <ServiceSelection form={form as unknown as UseFormReturn<FieldValues>} />}
            {currentStep === 3 && <PaymentConditions form={form as unknown as UseFormReturn<FieldValues>} />}
            {currentStep === 4 && <Review form={form as unknown as UseFormReturn<FieldValues>} />}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-between">
            <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || loading}
                className="border-white/10 hover:bg-white/5 text-white"
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>

            {currentStep < 4 ? (
                <Button 
                    onClick={nextStep}
                    className="bg-primary-500 hover:bg-primary-600 text-black font-bold"
                >
                    Próximo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            ) : (
                <Button 
                    onClick={handleSubmit(onSubmit, (errors) => console.error("Validation Errors:", errors))}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2 h-4 w-4" />}
                    Finalizar Orçamento
                </Button>
            )}
        </div>

    </div>
  );
}
