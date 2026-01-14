"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, Package, Filter } from "lucide-react";
import { useModal } from "@/contexts/modal-context";
import { NewServiceModal } from "@/components/modals/new-service-modal";
import { supabase } from "@/lib/supabase";
import { ServiceCard, Service } from "@/components/services/service-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ServicesPage() {
  const { openModal } = useModal();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Filtro
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchServices = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const { data, error } = await supabase.from("services").select("*").order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setServices(data as Service[]);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices(); // loading is already true by default
  }, [fetchServices]);

  // Ações
  const handleDelete = async (id: string) => {
      if(!confirm("Tem certeza que deseja excluir este serviço?")) return;
      await supabase.from('services').delete().eq('id', id);
      fetchServices(true); // Refresh with loading state
  };

  const handleEdit = (service: Service) => {
      // Mapeia os dados do serviço para o formato que o Modal espera (camelCase vs snake_case)
      openModal(<NewServiceModal initialValues={{
          name: service.name,
          description: service.description,
          price: service.price,
          category: service.category,
          isRecurring: service.is_recurring,
          recurringPeriod: service.recurring_period
      }} />);
  };

  // Lógica de Filtragem
  const filteredServices = useMemo(() => {
      return services.filter(service => {
          const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase()) || 
                                (service.description?.toLowerCase() || "").includes(search.toLowerCase());
          const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
          
          return matchesSearch && matchesCategory;
      });
  }, [services, search, categoryFilter]);

  const uniqueCategories = Array.from(new Set(services.map(s => s.category))).filter(Boolean);

  return (
    <div className="p-8 space-y-8 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Catálogo de Serviços</h1>
          <p className="text-zinc-400 mt-1">
            Gerencie seus produtos, serviços e planos recorrentes.
          </p>
        </div>

        <Button
          onClick={() => openModal(<NewServiceModal />)}
          className="bg-primary-500 hover:bg-primary-600 text-black font-bold shadow-lg shadow-primary-500/20"
        >
          <Plus size={18} className="mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-zinc-900/40 p-1.5 rounded-xl border border-white/5">
         <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
             <Input 
                placeholder="Buscar serviços..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-transparent border-transparent focus-visible:ring-0 placeholder:text-zinc-600 h-10 text-white"
             />
         </div>
         
         <div className="h-6 w-px bg-white/10 hidden sm:block self-center" />
         
         <div className="w-full sm:w-[200px]">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-transparent border-transparent h-10 focus:ring-0 text-zinc-300">
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-zinc-500" />
                        <SelectValue placeholder="Categoria" />
                    </div>
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                    <SelectItem value="all">Todas Categorias</SelectItem>
                    {uniqueCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
         </div>
      </div>

      {/* Grid Content */}
      {loading ? (
           <div className="flex-1 flex items-center justify-center text-zinc-500">Carregando catálogo...</div>
      ) : filteredServices.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-dashed border-white/10 rounded-2xl bg-zinc-900/20">
              <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 text-zinc-600">
                  <Package size={32} />
              </div>
              <h3 className="text-lg font-medium text-white mb-1">Nenhum serviço encontrado</h3>
              <p className="text-sm text-zinc-500 max-w-sm text-center">
                  {search ? `Não encontramos nada para "${search}".` : "Comece adicionando seus serviços ou pacotes."}
              </p>
              {search && (
                  <Button variant="link" onClick={() => setSearch("")} className="text-primary-500 mt-2">
                      Limpar busca
                  </Button>
              )}
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service: Service) => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
      )}
    </div>
  );
}
