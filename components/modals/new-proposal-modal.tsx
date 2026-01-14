"use client";

import { Modal } from "@/components/ui/modal";
import { useState, useEffect } from "react";
import { Check, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { supabase } from "@/lib/supabase";

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
}

export function NewProposalModal() {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      const { data } = await supabase.from('services').select('*');
      
      if (data) {
        setServices(data);
      }
      setLoading(false);
    }

    fetchServices();
  }, []);

  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <Modal title="Nova Proposta">
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-zinc-400 mb-4">Selecione os serviços do orçamento</h4>
          
          {loading ? (
            <div className="text-zinc-500 text-sm">Carregando serviços...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => {
                const isSelected = selectedServices.includes(service.id);
                return (
                  <div 
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={clsx(
                      "cursor-pointer p-4 rounded-xl border transition-all duration-200 relative overflow-hidden group",
                      isSelected 
                        ? "bg-primary-500/10 border-primary-500" 
                        : "bg-zinc-800/50 border-white/5 hover:border-white/20 hover:bg-zinc-800"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className={clsx("font-semibold mb-1", isSelected ? "text-primary-500" : "text-white")}>
                          {service.title}
                        </h5>
                        <p className="text-xs text-zinc-400">{service.description}</p>
                      </div>
                      {isSelected && (
                        <div className="bg-primary-500 rounded-full p-1 text-black">
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <span className="text-xs font-mono text-zinc-500">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button 
            className="flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-6 py-2.5 rounded-lg font-medium transition-colors"
            onClick={() => console.log('Criar proposta com:', selectedServices)}
          >
            Continuar
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </Modal>
  );
}
