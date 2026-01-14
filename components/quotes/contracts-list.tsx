import { useState, useEffect, useCallback } from "react";
import { FileText, Search, Download, Eye, Loader2, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { NewContractModal } from "./new-contract-modal";
import { ContractSettingsModal } from "./contract-settings-modal";
import { useModal } from "@/contexts/modal-context";

interface Contract {
  id: string;
  created_at: string;
  status: string;
  conteudo_final: string;
  orcamento?: { // Join result
      titulo: string;
      client?: {
          name: string;
      };
  };
}

export function ContractsList() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const { openModal } = useModal();

  const fetchContracts = useCallback(async (showLoading = false) => {
      if (showLoading) setLoading(true);
      const { data, error } = await supabase
        .from('contratos')
        .select(`
            *,
            orcamento:orcamentos (
                titulo,
                client:clients (
                    name
                )
            )
        `)
        .order('created_at', { ascending: false });
        
      if (error) console.error("Contracts Error:", error);
      if (data) setContracts(data as unknown as Contract[]);
      setLoading(false);
  }, []);

  useEffect(() => {
      fetchContracts(); 
  }, [fetchContracts]);

  const handleView = (contract: Contract) => {
      openModal(
          <div className="bg-white text-black p-8 rounded-lg max-w-4xl mx-auto h-[80vh] overflow-y-auto">
             <div dangerouslySetInnerHTML={{ __html: contract.conteudo_final }}></div>
          </div>
      );
  };

  const handleDownload = (contract: Contract) => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
          printWindow.document.write(`
              <html>
                  <head>
                      <title>${contract.orcamento?.titulo || 'Contrato'} - ${contract.orcamento?.client?.name || 'Cliente'}</title>
                      <style>
                          body { font-family: sans-serif; padding: 40px; }
                          @media print {
                              body { padding: 0; }
                          }
                      </style>
                  </head>
                  <body>
                      ${contract.conteudo_final}
                  </body>
              </html>
          `);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
      }
  };

  const handleOpenSettings = () => {
    openModal(<ContractSettingsModal />);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Contratos Gerados</h2>
            <div className="flex gap-4">
                <div className="relative w-64">
                    <Input placeholder="Buscar contratos..." className="bg-zinc-900/50 border-white/5 pl-9 text-white" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                </div>
                <button 
                    onClick={handleOpenSettings}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg border border-white/10 flex items-center gap-2 transition-colors"
                >
                    <Settings size={16} />
                    Configurar Modelo
                </button>
                <NewContractModal onUpdate={fetchContracts} />
            </div>
        </div>

        {loading ? (
             <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary-500" />
             </div>
        ) : contracts.length === 0 ? (
             <div className="min-h-[400px] flex flex-col items-center justify-center text-zinc-500 gap-4 border border-dashed border-white/10 rounded-2xl bg-black/20 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center border border-white/5">
                    <FileText size={32} className="opacity-50 text-primary-500" />
                </div>
                <div className="text-center">
                    <p className="font-medium text-zinc-300">Nenhum contrato gerado ainda</p>
                    <p className="text-sm text-zinc-500 mt-1">Gere contratos a partir de orçamentos aprovados.</p>
                </div>
           </div>
        ) : (
            <div className="bg-black/30 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                <table className="w-full text-sm text-left">
                    <thead className="bg-black/20 text-zinc-400 font-medium">
                        <tr>
                            <th className="px-6 py-4">Título</th>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4">Data</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-zinc-300">
                        {contracts.map(c => (
                            <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4 font-medium text-white group-hover:text-primary-500 transition-colors">
                                    {c.orcamento?.titulo || 'Contrato sem Título'}
                                </td>
                                <td className="px-6 py-4">
                                    {c.orcamento?.client?.name || 'Cliente Desconhecido'}
                                </td>
                                <td className="px-6 py-4">{new Date(c.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-primary-500/10 text-primary-500 border border-primary-500/20 capitalize shadow-[0_0_10px_rgba(121,205,37,0.2)]">
                                        {c.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => handleView(c)}
                                            className="p-2 hover:bg-white/10 rounded transition-colors text-zinc-400 hover:text-white" 
                                            title="Visualizar"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDownload(c)}
                                            className="p-2 hover:bg-white/10 rounded transition-colors text-zinc-400 hover:text-primary-500" 
                                            title="Baixar PDF"
                                        >
                                            <Download size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
}
