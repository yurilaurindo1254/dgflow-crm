"use client";

import { Modal } from "@/components/ui/modal";
import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useModal } from "@/contexts/modal-context";

export function WebhookConfigModal() {
  const { closeModal } = useModal();
  const [userId, setUserId] = useState<string>("");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Construct URL dynamically from env if possible, or fallback to screenshot value
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wpmytsxpxtmejpokhokt.supabase.co";
  const webhookUrl = `${supabaseUrl}/functions/v1/webhook-lead`;

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    }
    getUser();
  }, []);

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const payloadExample = {
    user_id: userId || "SEU_USER_ID",
    customer_name: "Nome do Cliente",
    email: "cliente@email.com",
    phone: "(11) 99999-9999",
    project: "Descrição do projeto",
    estimated_value: 5000,
    pipeline_id: "opcional-id-do-pipeline"
  };

  return (
    <Modal title="Configurar Webhook para Formulários">
      <div className="space-y-6 text-sm">
        
        {/* Webhook URL */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase">URL do Webhook</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-black/20 border border-pink-500/30 rounded-lg p-3 text-pink-400 font-mono break-all line-clamp-1">
              {webhookUrl}
            </div>
            <button 
                onClick={() => copyToClipboard(webhookUrl, setCopiedUrl)}
                className="bg-zinc-800 hover:bg-zinc-700 p-3 rounded-lg border border-white/5 transition-colors"
            >
              {copiedUrl ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-zinc-400" />}
            </button>
          </div>
          <p className="text-[10px] text-zinc-500">Use esta URL no seu formulário WordPress ou em qualquer ferramenta que envie webhooks.</p>
        </div>

        {/* User ID */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase">Seu User ID</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 text-zinc-300 font-mono">
              {userId || "Carregando..."}
            </div>
            <button 
                onClick={() => copyToClipboard(userId, setCopiedId)}
                className="bg-zinc-800 hover:bg-zinc-700 p-3 rounded-lg border border-white/5 transition-colors"
            >
              {copiedId ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-zinc-400" />}
            </button>
          </div>
          <p className="text-[10px] text-zinc-500">Inclua este ID no corpo da requisição do webhook.</p>
        </div>

        {/* Payload Example */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase">Exemplo de Payload (JSON)</label>
          <div className="relative group">
            <pre className="bg-black/40 border border-white/5 rounded-xl p-4 text-zinc-400 font-mono text-[11px] overflow-x-auto">
{JSON.stringify(payloadExample, null, 2)}
            </pre>
            <button 
                onClick={() => copyToClipboard(JSON.stringify(payloadExample, null, 2), setCopiedPayload)}
                className="absolute top-3 right-3 bg-zinc-800/80 hover:bg-zinc-700 p-2 rounded-lg border border-white/5 transition-colors opacity-0 group-hover:opacity-100"
            >
              {copiedPayload ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-zinc-400" />}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-zinc-950/50 border border-white/5 rounded-xl p-4 space-y-3">
          <h4 className="font-bold text-zinc-300">Como configurar no WordPress:</h4>
          <ol className="list-decimal list-inside space-y-2 text-zinc-400 text-[12px]">
            <li>Instale um plugin de formulário (ex: Contact Form 7, WPForms)</li>
            <li>Configure o webhook para enviar dados para a URL acima</li>
            <li>Certifique-se de incluir o <span className="text-zinc-200 font-mono text-[10px]">user_id</span> no corpo da requisição</li>
            <li>Configure os campos do formulário para mapear os dados corretamente</li>
          </ol>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
            <button 
                onClick={closeModal} 
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg shadow-pink-500/20"
            >
                Fechar
            </button>
        </div>
      </div>
    </Modal>
  );
}
