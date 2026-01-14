"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Quote, QuoteItem } from "@/lib/schemas/quote";
import { supabase } from "@/lib/supabase";
import { Loader2, Calendar, Clock, Box } from "lucide-react";


interface QuoteDetailsModalProps {
    quote: Quote & { id: string; created_at: string; prazo_entrega: string; data_validade: string }; // Intersection to ensure required fields
}

export function QuoteDetailsModal({ quote }: QuoteDetailsModalProps) {
    const [items, setItems] = useState<QuoteItem[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDetails() {
            setLoading(true);
            const { data } = await supabase
                .from('itens_orcamento')
                .select('*')
                .eq('orcamento_id', quote.id);
            
            if (data) setItems(data);
            setLoading(false);
        }
        fetchDetails();
    }, [quote.id]);

    return (
        <Modal title={`Detalhes: ${quote.titulo}`}>
            <div className="space-y-6">
                
                {/* Header Stats */}
                <div className="grid grid-cols-3 gap-4">
                     <div className="bg-white/5 p-3 rounded-lg flex flex-col items-center text-center gap-1">
                        <Calendar size={16} className="text-zinc-500" />
                        <span className="text-zinc-500 text-[10px] uppercase font-bold">Validade</span>
                        <span className="text-white text-sm font-bold">{new Date(quote.data_validade).toLocaleDateString()}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg flex flex-col items-center text-center gap-1">
                        <Clock size={16} className="text-zinc-500" />
                        <span className="text-zinc-500 text-[10px] uppercase font-bold">Entrega</span>
                        <span className="text-white text-sm font-bold">{quote.prazo_entrega}</span>
                    </div>
                     <div className="bg-white/5 p-3 rounded-lg flex flex-col items-center text-center gap-1">
                        <Box size={16} className="text-zinc-500" />
                        <span className="text-zinc-500 text-[10px] uppercase font-bold">Itens</span>
                        <span className="text-white text-sm font-bold">{items.length}</span>
                    </div>
                </div>

                {/* Items List */}
                <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                    <div className="px-4 py-2 bg-white/5 border-b border-white/5 text-xs font-bold text-zinc-500 uppercase flex justify-between">
                        <span>Item</span>
                        <span>Total</span>
                    </div>
                    <div className="divide-y divide-white/5 max-h-[200px] overflow-y-auto">
                        {loading ? (
                            <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>
                        ) : items.length === 0 ? (
                             <div className="p-4 text-center text-zinc-500 text-sm">Nenhum item encontrado.</div>
                        ) : items.map((item, i) => (
                            <div key={i} className="px-4 py-3 flex justify-between items-center hover:bg-white/5 transition-colors">
                                <div>
                                    <p className="text-sm font-medium text-white">{item.nome_item}</p>
                                    <p className="text-xs text-zinc-500">{item.quantidade}x R$ {item.valor_unitario?.toFixed(2)}</p>
                                </div>
                                <p className="text-sm font-bold text-zinc-300">R$ {item.valor_total?.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals */}
                <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Subtotal</span>
                        <span className="text-zinc-300">R$ {quote.subtotal?.toFixed(2)}</span>
                    </div>
                    {quote.desconto > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Desconto</span>
                            <span className="text-red-400">- R$ {quote.desconto?.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg font-bold">
                        <span className="text-white">Total</span>
                        <span className="text-primary-500">R$ {quote.total?.toFixed(2)}</span>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="text-xs text-zinc-600 text-center">
                    Criado em {new Date(quote.created_at).toLocaleString()}
                </div>

            </div>
        </Modal>
    );
}
