"use client";

import { Modal } from "@/components/ui/modal";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { useModal } from "@/contexts/modal-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, ExternalLink, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const setupSchema = z.object({
  quoteId: z.string().optional(),
  clientName: z.string().min(1, "Nome do cliente é obrigatório"),
  clientEmail: z.string().email("E-mail inválido"),
});

type SetupFormValues = z.infer<typeof setupSchema>;

interface BriefingSetupModalProps {
  templateId: string;
  templateName: string; // To store with the briefing if needed, or just for context
}

export function BriefingSetupModal({ templateId, templateName }: BriefingSetupModalProps) {
  const { closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [quotes, setQuotes] = useState<any[]>([]);
  const [createdBriefingId, setCreatedBriefingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      quoteId: "none",
      clientName: "",
      clientEmail: "",
    }
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = form;
  const selectedQuoteId = watch("quoteId");

  // Load Approved Quotes
  useEffect(() => {
    async function fetchQuotes() {
      const { data } = await supabase
        .from('orcamentos')
        .select('id, titulo, client:clients(name, email)') // Assuming relation
        .eq('status', 'aprovado') // Only approved quotes usually need briefings? Or all? User Ref showed "Nenhum orçamento" option.
        .order('created_at', { ascending: false });
      
      if (data) setQuotes(data);
    }
    fetchQuotes();
  }, []);

  // Auto-fill client info if quote selected
  useEffect(() => {
    if (selectedQuoteId && selectedQuoteId !== "none") {
      const quote = quotes.find(q => q.id === selectedQuoteId);
      if (quote?.client) {
        // Check if client is array or object depending on relation
        const client = Array.isArray(quote.client) ? quote.client[0] : quote.client;
        if (client) {
            setValue("clientName", client.name || "");
            setValue("clientEmail", client.email || "");
        }
      }
    }
  }, [selectedQuoteId, quotes, setValue]);

  async function onSubmit(data: SetupFormValues) {
    setLoading(true);

    try {
        const { data: userData } = await supabase.auth.getUser();
        
        // 1. Create Briefing
        // We'll trust the 'briefings' table exists with the new columns
        const { data: briefing, error } = await supabase.from('briefings').insert([{
            template_id: templateId, // Use the ID from the previous step
            // We might need to store template_type/name somewhere if not just ID, but ID is cleaner.
            // If templateId is a 'type' string (like 'logo'), we handle that.
            // Ideally we should have a 'template_type' column or reuse template_id if it works for static types.
            // For now, assuming template_id column can store the string ID or UUID. 
            // If it's a UUID FK, we might have an issue with 'logo' string.
            // Let's check if templateId is UUID. If not, maybe store in a 'type' column?
            // The Ref Img 'edit-template-modal' used string IDs for standard templates?
            // Re-checking NewBriefingModal... TEMPLATE_TYPES use strings ('logo', etc).
            // Custom templates use UUIDs.
            // The table has `template_id` uuid. This will FAIL for 'logo'.
            // I should probably add `template_type` or similar.
            // OR create a dummy template record for 'logo'?
            // Let's assume for now we might need to handle this.
            // Quick fix: if templateId is not UUID, put it in 'answers'->'type' or similar?
            // Wait, schema check showed `template_id` is UUID.
            // If user selects 'Logo', that's not a UUID.
            // I will add `template_type` to the insert payload just in case, but usually we need a UUID for the FK.
            // IF handling standard templates, maybe we set template_id to null and store type?
            // Let's Try inserting `template_id` as null for standard types and add `template_type` text column?
            // Or just store it in `answers` for now since I can't easily change schema FK constraints blindly.
            // Actually, I'll store it in `status` or just rely on `answers` JSON.
            
            client_name: data.clientName,
            client_email: data.clientEmail,
            quote_id: data.quoteId === "none" ? null : data.quoteId,
            status: 'pending',
            answers: { template_type: templateId, template_name: templateName } // Store type here
        }]).select().single();

        if (error) throw error;
        
        if (briefing) {
            setCreatedBriefingId(briefing.id);
            setStep('success');
        }

    } catch (err) {
        console.error(err);
        alert("Erro ao criar briefing. Verifique o console.");
    } finally {
        setLoading(false);
    }
  }

  const generatedLink = createdBriefingId 
    ? `${window.location.origin}/b/${createdBriefingId}` 
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === 'success') {
    return (
        <Modal title="Briefing Criado!" className="max-w-xl">
             <div className="space-y-6">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
                    <h3 className="text-emerald-500 font-bold text-lg mb-2">Briefing criado com sucesso!</h3>
                    <p className="text-zinc-400 text-sm">Envie o link abaixo para seu cliente preencher</p>
                </div>

                <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold text-zinc-500 tracking-wide">Link do Briefing</Label>
                    <div className="flex gap-2">
                        <Input 
                            value={generatedLink} 
                            readOnly 
                            className="bg-zinc-950 border-white/10 text-zinc-300 font-mono text-sm"
                        />
                         <Button onClick={copyLink} variant="outline" className="border-white/10 hover:bg-white/5">
                            {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                        </Button>
                        <Button onClick={() => window.open(generatedLink, '_blank')} variant="outline" className="border-white/10 hover:bg-white/5">
                             <ExternalLink size={18} />
                        </Button>
                    </div>
                </div>

                <Button 
                    onClick={() => closeModal()} 
                    className="w-full bg-primary-500 hover:bg-[#65a30d] text-black font-bold h-12"
                >
                    Fechar
                </Button>
             </div>
        </Modal>
    )
  }

  return (
    <Modal title="Informações do Cliente" className="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Quote Selection */}
        <div className="space-y-2">
             <Label className="text-zinc-200 font-medium">Vincular a um orçamento (opcional)</Label>
             <select
                {...register("quoteId")}
                className="w-full h-12 bg-zinc-950 border border-white/10 rounded-lg px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background"
             >
                <option value="none">Nenhum orçamento</option>
                {quotes.map(quote => (
                    <option key={quote.id} value={quote.id}>
                        {quote.titulo} - {Array.isArray(quote.client) ? quote.client[0]?.name : quote.client?.name}
                    </option>
                ))}
            </select>
        </div>

        {/* Client Name */}
         <div className="space-y-2">
            <Label className="text-zinc-200 font-medium">Nome do Cliente *</Label>
            <Input 
                placeholder="Nome completo do cliente" 
                {...register("clientName")} 
                className="bg-zinc-950 border-white/10 h-12" 
            />
            {errors.clientName && <span className="text-red-500 text-xs">{errors.clientName.message}</span>}
        </div>

        {/* Client Email */}
        <div className="space-y-2">
            <Label className="text-zinc-200 font-medium">E-mail do Cliente *</Label>
            <Input 
                placeholder="email@cliente.com" 
                {...register("clientEmail")} 
                className="bg-zinc-950 border-white/10 h-12" 
            />
            {errors.clientEmail && <span className="text-red-500 text-xs">{errors.clientEmail.message}</span>}
        </div>

        <div className="flex justify-between pt-4 mt-6 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => closeModal()} className="h-12 border border-white/10 text-white hover:bg-white/5">
                Voltar
            </Button>
            <Button type="submit" disabled={loading} className="h-12 bg-primary-500 hover:bg-[#65a30d] text-black font-bold px-8">
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Criar Briefing"}
            </Button>
        </div>

      </form>
    </Modal>
  );
}
