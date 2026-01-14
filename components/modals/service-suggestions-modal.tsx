"use client";

import { Modal } from "@/components/ui/modal";
import { Package } from "lucide-react";

export interface Suggestion {
    name: string;
    description: string;
    price: number;
    category: string;
    isRecurring: boolean;
    recurringPeriod?: string;
}

const SUGGESTIONS_DATA = {
    Designers: [
        { name: "Logo Design", description: "Criação de identidade visual completa", price: 1500, category: "Design", isRecurring: false },
        { name: "Social Media Pack", description: "Pacote mensal de posts para redes sociais", price: 800, category: "Social Media", isRecurring: true, recurringPeriod: "Mensal" },
        { name: "Landing Page", description: "Design de página de vendas", price: 2500, category: "Design", isRecurring: false },
        { name: "UI/UX Design", description: "Interface completa para aplicativo ou sistema", price: 3500, category: "Design", isRecurring: false },
        { name: "Branding Completo", description: "Manual de marca, logo, aplicações", price: 5000, category: "Design", isRecurring: false },
    ],
    "Gestores de Tráfego": [
        { name: "Gestão de Tráfego Pago", description: "Gerenciamento mensal de campanhas", price: 1500, category: "Tráfego Pago", isRecurring: true, recurringPeriod: "Mensal" },
        { name: "Setup de Campanhas", description: "Configuração inicial de campanhas", price: 800, category: "Tráfego Pago", isRecurring: false },
        { name: "Consultoria de Estratégia", description: "Planejamento estratégico de marketing", price: 1200, category: "Consultoria", isRecurring: false },
        { name: "Otimização de Conversão", description: "Análise e otimização de funil de vendas", price: 2000, category: "Tráfego Pago", isRecurring: false },
        { name: "Relatórios e Análises", description: "Relatório mensal detalhado de resultados", price: 600, category: "Tráfego Pago", isRecurring: true, recurringPeriod: "Mensal" },
    ]
};

interface ServiceSuggestionsModalProps {
    onSelect: (suggestion: Suggestion) => void;
    onBack: () => void;
}

export function ServiceSuggestionsModal({ onSelect, onBack }: ServiceSuggestionsModalProps) {
  return (
    <Modal title="Sugestões de Serviços" >
        <div className="space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar p-1">
             <div className="text-primary-500 font-medium text-sm flex items-center gap-2 mb-4">
                 <Package size={16} />
                 Escolha um modelo para começar
             </div>

             {Object.entries(SUGGESTIONS_DATA).map(([category, items]) => (
                <div key={category}>
                    <h3 className="text-zinc-400 font-bold mb-3 text-sm uppercase tracking-wider">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {items.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => onSelect(item)}
                                className="text-left bg-zinc-900 border border-white/5 hover:border-primary-500/50 hover:bg-zinc-800 p-4 rounded-xl transition-all group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-white group-hover:text-primary-500 transition-colors">{item.name}</h4>
                                </div>
                                <p className="text-xs text-zinc-400 mb-3 line-clamp-2 min-h-[32px]">{item.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-primary-500 font-bold text-sm">
                                        R$ {item.price.toLocaleString('pt-BR')}
                                        {item.isRecurring && <span className="text-xs font-normal text-zinc-500 ml-1">/{item.recurringPeriod?.toLowerCase()}</span>}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
             ))}

             <div className="pt-4 mt-4 border-t border-white/10">
                <button 
                    onClick={onBack}
                    className="w-full bg-transparent border border-primary-500/30 text-primary-500 hover:bg-primary-500/10 py-3 rounded-xl font-bold transition-colors"
                >
                    Ou criar serviço personalizado
                </button>
             </div>
        </div>
    </Modal>
  );
}
