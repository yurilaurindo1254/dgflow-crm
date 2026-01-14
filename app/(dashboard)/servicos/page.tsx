"use client";

import { useState } from "react";
import { Plus, Package, FileText, Lightbulb } from "lucide-react";
import { useModal } from "@/contexts/modal-context";
import { NewServiceModal } from "@/components/modals/new-service-modal";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import Link from "next/link";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_recurring: boolean;
  recurring_period: string;
}

export default function ServicesPage() {
  const { openModal } = useModal();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      const { data } = await supabase.from("services").select("*").order('created_at', { ascending: false });
      if (data) setServices(data);
      setLoading(false);
    }
    fetchServices();
  }, []);

  return (
    <div className="p-8 space-y-8 h-full flex flex-col max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Meus Serviços</h1>
        <p className="text-zinc-400">
          Gerencie seu catálogo de serviços e preços
        </p>
      </div>

      {/* Actions Bar (Matches Screenshot 4) */}
      <div className="flex gap-4">
          <Link href="/orcamentos">
            <button className="flex items-center gap-2 bg-transparent border border-pink-500/30 text-pink-500 hover:bg-pink-500/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <FileText size={16} />
                Novo Orçamento
            </button>
          </Link>
        <button
          onClick={() => openModal(<NewServiceModal />)}
          className="flex items-center gap-2 bg-linear-to-r from-pink-500 to-orange-500 hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm shadow-lg shadow-pink-500/20 transition-all font-bold"
        >
          <Plus size={16} />
          Novo Serviço
        </button>
      </div>

      {/* Content Area */}
      {services.length === 0 && !loading ? (
          <div className="flex-1 flex items-center justify-center bg-zinc-900 border border-white/10 rounded-xl min-h-[400px]">
            <div className="text-center">
                <div className="w-20 h-20 bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-500">
                    <Package size={40} />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">
                    Nenhum serviço cadastrado ainda.
                </h3>
                  <p className="text-zinc-400 text-sm mb-8">
                    Comece adicionando seu primeiro serviço ou escolha um modelo pronto.
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                         onClick={() => openModal(<NewServiceModal />)}
                         className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-300 font-bold transition-all flex items-center gap-2"
                    >
                        <Lightbulb size={20} className="text-primary-500" />
                        Ver Sugestões
                    </button>
                    <button
                        onClick={() => openModal(<NewServiceModal />)}
                        className="bg-linear-to-r from-pink-500 to-orange-500 hover:opacity-90 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-pink-500/20 transition-all inline-flex items-center gap-2 text-lg"
                    >
                        <Plus size={20} />
                        Novo Serviço
                    </button>
                </div>
            </div>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/5 hover:border-pink-500/30 transition-all group hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-lg bg-zinc-800 text-pink-500">
                        <Package size={24} />
                    </div>
                     <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/5 text-zinc-400 border border-white/5 uppercase tracking-wider">
                        {service.category || 'Geral'}
                    </span>
                </div>
                
                <h3 className="text-white font-bold text-lg mb-2">{service.name}</h3>
                <p className="text-zinc-400 text-sm line-clamp-2 mb-4 h-10">{service.description}</p>
                
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                         <span className="text-xl font-bold text-white">
                            R$ {service.price?.toLocaleString('pt-BR')}
                        </span>
                        {service.is_recurring && (
                            <span className="text-xs text-zinc-500 ml-1">/{service.recurring_period?.toLowerCase()}</span>
                        )}
                    </div>
                </div>
              </div>
            ))}
          </div>
      )}
    </div>
  );
}
