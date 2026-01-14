import { UseFormReturn, FieldValues, Controller } from "react-hook-form";
import { Quote } from "@/lib/schemas/quote";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ReviewProps {
  form: UseFormReturn<FieldValues>;
}

export function Review({ form }: ReviewProps) {
  const { getValues, control, setValue, watch } = form as unknown as UseFormReturn<Quote>;
  const values = getValues();
  // Watch for real-time updates if needed, though getValues is usually fine for initial render in wizard steps
  // But if we want the total to be dynamic if edited elsewhere (unlikely here), watch is better.
  // For the Review step, usually we just read.
  
  // We need to register/control the toggle.
  const asaasEnabled = watch("forma_pagamento_config.asaas_enabled");

  return (
    <div className="space-y-6 bg-zinc-900/50 p-6 rounded-xl border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="border-b border-white/10 pb-4 flex justify-between items-start">
        <div>
            <h3 className="text-xl font-bold text-white mb-1">{values.titulo}</h3>
            <p className="text-zinc-400 text-sm">{values.descricao}</p>
        </div>
        <div className="text-right">
             <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${values.status === 'rascunho' ? 'bg-zinc-800 text-zinc-400' : 'bg-primary-500/20 text-primary-500'}`}>
                 {values.status}
             </span>
        </div>
      </div>

      <div className="space-y-4">
          <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Itens</h4>
          {values.itens && values.itens.length > 0 ? (
              <ul className="space-y-3">
                  {values.itens.map((item, i) => (
                      <li key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                          <div className="flex gap-3">
                                <span className="text-zinc-500 font-mono">x{item.quantidade}</span>
                                <span className="text-zinc-200">{item.nome_item}</span>
                          </div>
                          <span className="text-zinc-300 font-mono">R$ {(item.valor_unitario * item.quantidade).toFixed(2)}</span>
                      </li>
                  ))}
              </ul>
          ) : (
              <p className="text-zinc-500 italic text-sm">Nenhum item adicionado.</p>
          )}
      </div>

       {/* Asaas Integration Toggle */}
       <div className="bg-zinc-950 p-4 rounded-lg border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-blue-900/20 p-2 rounded text-blue-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                </div>
                <div>
                    <Label htmlFor="asaas-toggle" className="text-white font-medium cursor-pointer">Integração Asaas</Label>
                    <p className="text-xs text-zinc-500">Gerar link de pagamento automático ao aprovar.</p>
                </div>
            </div>
            <Controller
                control={control}
                name="forma_pagamento_config.asaas_enabled"
                render={({ field }) => (
                    <Checkbox
                        id="asaas-toggle"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-white/20"
                    />
                )}
            />
       </div>

      <div className="flex justify-between pt-4">
          <div className="text-sm text-zinc-400 space-y-1">
              <p>Validade: <span className="text-white">{values.data_validade}</span></p>
              <p>Entrega: <span className="text-white">{values.prazo_entrega}</span></p>
          </div>
          <div className="text-right">
              <p className="text-zinc-400 text-sm">Total a Pagar</p>
              <p className="text-3xl font-bold text-primary-500 tracking-tight">R$ {values.total.toFixed(2)}</p>
          </div>
      </div>
      
    </div>
  );
}
