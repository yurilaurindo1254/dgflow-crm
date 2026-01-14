"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle, XCircle, Calendar, Box, Clock } from "lucide-react";
import { useParams } from "next/navigation";
import { Quote, QuoteItem } from "@/lib/schemas/quote";

// Helper to inject dynamic colors
const setPageColors = (primary: string, secondary: string) => {
    document.documentElement.style.setProperty('--primary-color', primary);
    document.documentElement.style.setProperty('--secondary-color', secondary);
};

export default function PublicProposalPage() {
  const { id } = useParams();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [client, setClient] = useState<{
    id: string;
    name: string;
    address?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    cpf_cnpj?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    
    const { data: quoteData } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('id', id)
        .single();

    if (quoteData) {
        setQuote(quoteData);
        setPageColors(quoteData.cor_primaria, quoteData.cor_secundaria);

        // Fetch relations
        const { data: itemsData, error: itemsError } = await supabase
            .from('itens_orcamento')
            .select('*')
            .eq('orcamento_id', id);
        
        if (itemsError) {
            console.error("Error fetching quote items:", itemsError);
        } else {
            setItems(itemsData || []);
        }

        if (quoteData.cliente_id) {
            const { data: clientData, error: clientError } = await supabase
                .from('clients')
                .select('*')
                .eq('id', quoteData.cliente_id)
                .single();
            if (clientError) {
                console.error("Error fetching client:", clientError);
            } else {
                setClient(clientData);
            }
        }
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (newStatus: 'aprovado' | 'rejeitado') => {
      if (!quote) return;
      setActionLoading(true);
      try {
          const { error } = await supabase
              .from('orcamentos')
              .update({ status: newStatus })
              .eq('id', quote.id);

          if (error) throw error;
          
          setQuote({ ...quote, status: newStatus });

          if (newStatus === 'aprovado') {
              // Generate Contract
              try {
                  const { data: template } = await supabase
                    .from('modelos_contrato')
                    .select('*')
                    .eq('ativo', true)
                    .single();
                  
                  if (template) {
                      let content = template.conteudo;
                      
                      // Format currency helper
                      const fmt = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

                      // Client Replacements
                      content = content.replace(/{{Nome do Cliente}}/g, client?.name || "Cliente");
                      content = content.replace(/{{Endereço do Cliente}}/g, client?.address || "Endereço não informado");
                      content = content.replace(/{{Número do Endereço Cliente}}/g, client?.number || "S/N");
                      content = content.replace(/{{Bairro do Cliente}}/g, client?.neighborhood || "");
                      content = content.replace(/{{Cidade do Cliente}}/g, client?.city || "");
                      content = content.replace(/{{Estado do Cliente}}/g, client?.state || "");
                      content = content.replace(/{{CPF\/CNPJ do Cliente}}/g, client?.cpf_cnpj || "");
                      content = content.replace(/{{Representante do Cliente}}/g, client?.name || "Representante");

                      // Provider Replacements (Using generic or TODO as we don't have provider settings in this context yet)
                      // In a real app we'd fetch the tenant/user profile
                      content = content.replace(/{{Nome do Prestador}}/g, "PRESTADOR DE SERVIÇOS"); 
                      content = content.replace(/{{Endereço do Prestador}}/g, "Endereço do Prestador");
                      content = content.replace(/{{Número do Endereço Prestador}}/g, "");
                      content = content.replace(/{{Bairro do Prestador}}/g, "");
                      content = content.replace(/{{Cidade do Prestador}}/g, "Cidade");
                      content = content.replace(/{{Estado do Prestador}}/g, "UF");
                      content = content.replace(/{{CPF\/CNPJ do Prestador}}/g, "00.000.000/0001-00");

                      // Quote/Project Replacements
                      content = content.replace(/{{Nome do Projeto}}/g, quote.titulo);
                      const servicesList = items.map(i => `${i.nome_item} (${i.quantidade}x)`).join(', ');
                      content = content.replace(/{{Serviços Inclusos}}/g, servicesList);
                      content = content.replace(/{{Prazo do Contrato}}/g, `${quote.prazo_entrega} ${/^\d+$/.test(quote.prazo_entrega) ? 'dias' : ''}`);
                      
                      // Financials
                      const subtotalVal = items.reduce((acc, i) => acc + (Number(i.valor_total) || 0), 0);
                      const discountVal = quote.desconto || 0;
                      const totalVal = subtotalVal - discountVal;

                      content = content.replace(/{{Valor Total}}/g, fmt(subtotalVal));
                      content = content.replace(/{{Valor do Desconto}}/g, fmt(discountVal));
                      content = content.replace(/{{Valor Final}}/g, fmt(totalVal));
                      
                      // Payment Conditions (Placeholder logic)
                      content = content.replace(/{{Condições de Pagamento}}/g, "A combinar");
                      content = content.replace(/{{Forma de Pagamento}}/g, "Transferência/Boleto");
                      content = content.replace(/{{Número de Parcelas}}/g, "1x");

                      content = content.replace(/{{Data}}/g, new Date().toLocaleDateString());
                      
                      const { error: contractError } = await supabase
                        .from('contratos')
                        .insert({
                            orcamento_id: quote.id,
                            conteudo_final: content,
                            status: 'pendente'
                        });
                        
                      if (contractError) console.error("Error creating contract:", contractError);
                      else alert("Proposta aprovada e contrato gerado com sucesso! Em breve entraremos em contato.");
                  } else {
                      alert("Proposta aprovada com sucesso! (Sem modelo de contrato ativo encontrado)");
                  }
              } catch (contractErr) {
                  console.error("Error in contract generation:", contractErr);
                  alert("Proposta aprovada, mas houve um erro ao gerar o contrato.");
              }
          } else {
              alert("Proposta rejeitada.");
          }
          
      } catch (err) {
          console.error(err);
          alert("Erro ao atualizar status.");
      } finally {
          setActionLoading(false);
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white"><Loader2 className="animate-spin" /></div>;
  if (!quote) return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">Proposta não encontrada.</div>;

  // Calculate totals from items to ensure accuracy
  const derivedSubtotal = items.reduce((acc, item) => acc + (Number(item.valor_total) || 0), 0);
  const derivedTotal = derivedSubtotal - (quote?.desconto || 0);

  // Helper for currency
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-(--primary-color) selection:text-white pb-20">
      
      {/* Header / Hero */}
      <header className="relative w-full h-[300px] overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-(--primary-color) opacity-20 blur-[100px]" />
          <div className="absolute inset-0 bg-linear-to-b from-zinc-950/50 to-zinc-950" />
          
          <div className="relative z-10 text-center space-y-4 px-4">
              <span className="inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs uppercase tracking-widest font-bold text-(--secondary-color)">
                  Proposta Comercial
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white max-w-2xl mx-auto leading-tight">
                  {quote.titulo}
              </h1>
              {client && <p className="text-lg text-zinc-400">Preparado para <span className="text-white font-medium">{client.name}</span></p>}
          </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 -mt-12 relative z-20 space-y-8">
          
          {/* Status Banner */}
          {quote.status !== 'enviado' && quote.status !== 'rascunho' && (
              <div className={`p-4 rounded-xl border flex items-center gap-3 justify-center font-medium
                ${quote.status === 'aprovado' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}
              `}>
                  {quote.status === 'aprovado' ? <CheckCircle /> : <XCircle />}
                  <span>Esta proposta foi {quote.status}.</span>
              </div>
          )}

          {/* Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-900/50 backdrop-blur border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-(--primary-color)/20 flex items-center justify-center text-(--primary-color)">
                      <Calendar size={20} />
                  </div>
                  <span className="text-zinc-500 text-xs uppercase">Validade</span>
                  <strong className="text-white">{new Date(quote.data_validade).toLocaleDateString()}</strong>
              </div>
              <div className="bg-zinc-900/50 backdrop-blur border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center gap-2">
                   <div className="w-10 h-10 rounded-full bg-(--secondary-color)/20 flex items-center justify-center text-(--secondary-color)">
                      <Clock size={20} />
                  </div>
                  <span className="text-zinc-500 text-xs uppercase">Prazo de Entrega</span>
                  <strong className="text-white">
                      {quote.prazo_entrega}
                      {/^\d+$/.test(quote.prazo_entrega) ? ' dias' : ''}
                  </strong>
              </div>
               <div className="bg-zinc-900/50 backdrop-blur border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center gap-2">
                   <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                      <Box size={20} />
                  </div>
                  <span className="text-zinc-500 text-xs uppercase">Total de Itens</span>
                  <strong className="text-white">{items.length} {items.length === 1 ? 'item incluso' : 'itens inclusos'}</strong>
              </div>
          </div>

          {/* Introduction / Description */}
          <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Sobre o Projeto</h3>
              <p className="text-zinc-400 leading-relaxed whitespace-pre-line">
                  {quote.descricao || "Nenhuma descrição fornecida."}
              </p>
          </div>

          {/* Items Table */}
          <div className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5">
                  <h3 className="text-xl font-bold text-white">Investimento Detalhado</h3>
              </div>
              <div className="p-6 space-y-6">
                  {items.map((item, i) => (
                      <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                          <div className="flex-1">
                              <h4 className="text-white font-bold text-lg mb-1">{item.nome_item}</h4>
                              <p className="text-zinc-500 text-sm">{item.descricao}</p>
                          </div>
                          <div className="text-right">
                              <span className="block text-zinc-500 text-sm">x{item.quantidade}</span>
                              <span className="text-white font-bold text-xl">{formatCurrency(item.valor_total || (item.quantidade * item.valor_unitario) || 0)}</span>
                          </div>
                      </div>
                  ))}
              </div>
              
              {/* Financial Summary */}
              <div className="bg-white/5 p-6 flex flex-col items-end gap-2">
                   <div className="flex justify-between w-full max-w-xs text-sm">
                       <span className="text-zinc-400">Subtotal</span>
                       <span className="text-white">{formatCurrency(derivedSubtotal)}</span>
                   </div>
                   {quote.desconto > 0 && (
                       <div className="flex justify-between w-full max-w-xs text-sm">
                           <span className="text-zinc-400">Desconto</span>
                           <span className="text-red-400">- {formatCurrency(quote.desconto)}</span>
                       </div>
                   )}
                   <div className="flex justify-between w-full max-w-xs pt-4 border-t border-white/10 mt-2">
                       <span className="text-zinc-200 font-bold text-lg">Investimento Total</span>
                       <span className="text-(--primary-color) font-bold text-2xl">{formatCurrency(derivedTotal)}</span>
                   </div>
              </div>
          </div>

          {/* Actions */}
          {(quote.status === 'enviado' || quote.status === 'rascunho') && (
               <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                  <button 
                      onClick={() => handleStatusChange('rejeitado')}
                      disabled={actionLoading}
                      className="px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-400 font-bold transition-colors disabled:opacity-50"
                  >
                      Rejeitar Proposta
                  </button>
                  <button 
                      onClick={() => handleStatusChange('aprovado')}
                       disabled={actionLoading}
                      className="px-8 py-4 rounded-xl bg-(--primary-color) hover:brightness-110 text-white font-bold shadow-lg shadow-(--primary-color)/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                  >
                      {actionLoading ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                      Aprovar Proposta
                  </button>
               </div>
          )}

      </main>

    </div>
  );
}
