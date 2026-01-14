
import { useState, useEffect } from "react";
import { Settings, Save, RotateCcw, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useModal } from "@/contexts/modal-context";

// Default template as backup
const DEFAULT_TEMPLATE = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

IDENTIFICAÇÃO DAS PARTES CONTRATANTES

(Preencha aqui o modelo do contrato...)
`;

// Shortcodes for reference
const SHORTCODES = [
    { code: "{{Nome do Cliente}}", desc: "Nome do Cliente" },
    { code: "{{Endereço do Cliente}}", desc: "Endereço do Prestador" },
    { code: "{{CPF/CNPJ do Cliente}}", desc: "CPF/CNPJ do Cliente" },
    { code: "{{Nome do Prestador}}", desc: "Nome do Prestador" },
    { code: "{{Valor Total}}", desc: "Valor Total do Orçamento" },
    { code: "{{Data}}", desc: "Data Atual" },
    { code: "{{Prazo do Contrato}}", desc: "Prazo de Entrega" },
    { code: "{{Serviços Inclusos}}", desc: "Lista de Itens" }
];

export function ContractSettingsModal() {
    const { closeModal } = useModal();
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    async function fetchTemplate() {
        setLoading(true);
        const { data } = await supabase
            .from('modelos_contrato')
            .select('*')
            .eq('ativo', true)
            .limit(1)
            .maybeSingle();
        
        if (data) {
            setContent(data.conteudo);
        } else {
            setContent(DEFAULT_TEMPLATE);
        }
        setLoading(false);
    }

    useEffect(() => {
        void fetchTemplate();
    }, []);

    async function handleSave() {
        setSaving(true);
        
        // Check if exists
        const { data: existing } = await supabase
            .from('modelos_contrato')
            .select('id')
            .eq('ativo', true)
            .limit(1)
            .maybeSingle();

        let error;
        
        if (existing) {
             const { error: updateError } = await supabase
                .from('modelos_contrato')
                .update({ conteudo: content })
                .eq('id', existing.id);
             error = updateError;
        } else {
             const { error: insertError } = await supabase
                .from('modelos_contrato')
                .insert({ conteudo: content, nome: 'Padrão', ativo: true });
             error = insertError;
        }

        if (error) {
            console.error(error);
            alert("Erro ao salvar modelo.");
        } else {
            alert("Modelo salvo com sucesso!");
            closeModal();
        }
        setSaving(false);
    }

    const insertShortcode = (code: string) => {
        setContent(prev => prev + code);
    };

    return (
        <div className="bg-zinc-950 text-white w-full max-w-5xl h-[85vh] flex flex-col rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                        <Settings size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Configurar Modelo de Contrato</h2>
                        <p className="text-xs text-zinc-400">Personalize o modelo de contrato padrão usando os shortcodes disponíveis</p>
                    </div>
                </div>
                <button onClick={() => fetchTemplate()} title="Recarregar" className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
                    <RotateCcw size={16} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor */}
                <div className="flex-1 p-6 flex flex-col gap-2 border-r border-white/10">
                    <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Modelo do Contrato</label>
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="animate-spin text-indigo-500" />
                        </div>
                    ) : (
                        <div className="flex-1 relative">
                            <textarea 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-full bg-zinc-900/50 border border-white/10 rounded-xl p-6 text-sm font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-zinc-300 custom-scrollbar"
                                placeholder="# CONTRATO..."
                                spellCheck={false}
                            />
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="w-80 bg-zinc-900/10 p-6 overflow-y-auto custom-scrollbar">
                    <h3 className="text-sm font-bold text-white mb-1">Shortcodes Disponíveis</h3>
                    <p className="text-xs text-zinc-500 mb-4">Clique para copiar e cole no modelo</p>

                    <div className="space-y-2">
                        {SHORTCODES.map((sc, i) => (
                            <div 
                                key={i} 
                                onClick={() => insertShortcode(sc.code)}
                                className="p-3 rounded-lg border border-white/5 bg-zinc-900/50 hover:bg-zinc-800 hover:border-indigo-500/30 cursor-pointer group transition-all active:scale-95"
                            >
                                <code className="text-xs text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded font-mono block mb-1 group-hover:text-indigo-300 w-fit">{sc.code}</code>
                                <span className="text-xs text-zinc-500 group-hover:text-zinc-400">{sc.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-zinc-900/30 flex justify-between items-center">
                <button 
                    onClick={() => setContent(DEFAULT_TEMPLATE)}
                    className="px-4 py-2 rounded-lg border border-white/10 text-zinc-400 text-sm hover:bg-white/5 hover:text-white transition-colors"
                >
                    Restaurar Padrão
                </button>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Salvar Template
                </button>
            </div>
        </div>
    );
}
