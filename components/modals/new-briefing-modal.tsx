"use client";

import { Modal } from "@/components/ui/modal";
import { useState, useEffect } from "react";
import { Video, LayoutTemplate, FolderKanban, Palette, FileText } from "lucide-react";
// import { EditTemplateModal } from "./edit-template-modal"; // Removed/Unused for now
import { BriefingSetupModal } from "./briefing-setup-modal";
import { useModal } from "@/contexts/modal-context";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const TEMPLATE_TYPES = [
    { 
        id: 'logo', 
        name: 'Logo', 
        description: 'Criação de logotipo e marca', 
        icon: Palette,
        color: 'text-primary-500',
        questionsCount: 8
    },
    { 
        id: 'landing-page', 
        name: 'Landing Page', 
        description: 'Página de conversão/vendas', 
        icon: LayoutTemplate,
        color: 'text-purple-500',
        questionsCount: 7
    },
    { 
        id: 'social', 
        name: 'Social Media / Criativos', 
        description: 'Posts, stories e anúncios', 
        icon: FolderKanban,
        color: 'text-blue-500',
        questionsCount: 5
    },
    { 
        id: 'branding', 
        name: 'Branding / Identidade Visual', 
        description: 'Identidade visual completa', 
        icon: Palette,
        color: 'text-emerald-500',
        questionsCount: 12
    },
    { 
        id: 'video', 
        name: 'Vídeo / Motion', 
        description: 'Vídeos e animações', 
        icon: Video,
        color: 'text-red-500',
        questionsCount: 6
    },
    { 
        id: 'other', 
        name: 'Outro', 
        description: 'Outro tipo de projeto', 
        icon: FileText,
        color: 'text-zinc-500',
        questionsCount: 4
    }
];

interface CustomTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
    questions_count: number;
}

export function NewBriefingModal() {
  const { openModal } = useModal();
  const [activeTab, setActiveTab] = useState<'my-templates' | 'standard'>('standard');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [loading] = useState(false);

  // Load custom templates on mount
  useEffect(() => {
    async function loadTemplates() {
        const { data } = await supabase.from('briefing_templates').select('*').eq('active', true);
        if (data) setCustomTemplates(data);
    }
    loadTemplates();
  }, []);

  const handleContinue = async () => {
    if (!selectedType) return;
    
    // Determine template name
    let templateName = "";
    const standardTemplate = TEMPLATE_TYPES.find(t => t.id === selectedType);
    if (standardTemplate) {
        templateName = standardTemplate.name;
    } else {
         const customTemplate = customTemplates.find(t => t.id === selectedType);
         if (customTemplate) templateName = customTemplate.name;
    }

    openModal(
        <BriefingSetupModal 
            templateId={selectedType}
            templateName={templateName}
        />
    );
  };

  return (
    <Modal title="Selecione o Tipo de Briefing" className="max-w-3xl">
      <div className="space-y-6">
        
        {/* Tabs */}
        <div className="flex p-1 bg-zinc-900 rounded-lg w-full">
            <button
                onClick={() => setActiveTab('my-templates')}
                className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                    activeTab === 'my-templates' 
                        ? "bg-zinc-800 text-white shadow-sm" 
                        : "text-zinc-500 hover:text-zinc-300"
                )}
            >
                ☆ Meus Templates
            </button>
            <button
                onClick={() => setActiveTab('standard')}
                className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-md transition-all border border-primary-500/20",
                    activeTab === 'standard' 
                        ? "bg-zinc-800 text-white shadow-sm border-primary-500/50" 
                        : "text-zinc-500 hover:text-zinc-300"
                )}
            >
                Templates Padrão
            </button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto custom-scrollbar p-1">
            {activeTab === 'standard' ? (
                TEMPLATE_TYPES.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={cn(
                            "text-left p-4 rounded-xl border transition-all flex items-start gap-4 group",
                            selectedType === type.id
                                ? "bg-zinc-900 border-primary-500 ring-1 ring-primary-500/50"
                                : "bg-zinc-950 border-white/5 hover:border-white/10 hover:bg-zinc-900"
                        )}
                    >
                        <div className={cn(
                            "p-3 rounded-lg bg-zinc-900 border border-white/5 group-hover:scale-105 transition-transform",
                            type.color
                        )}>
                            <type.icon size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm mb-1">{type.name}</h3>
                            <p className="text-xs text-zinc-400">{type.description}</p>
                        </div>
                    </button>
                ))
            ) : (
                customTemplates.length > 0 ? (
                    customTemplates.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => setSelectedType(template.id)}
                            className={cn(
                                "text-left p-4 rounded-xl border transition-all flex items-start gap-4 group",
                                selectedType === template.id
                                    ? "bg-zinc-900 border-primary-500 ring-1 ring-primary-500/50"
                                    : "bg-zinc-950 border-white/5 hover:border-white/10 hover:bg-zinc-900"
                            )}
                        >
                            <div className="p-3 rounded-lg bg-zinc-900 border border-white/5 group-hover:scale-105 transition-transform text-primary-500">
                                {/* Dynamic Icon lookup could be added here, using generic for now */}
                                <LayoutTemplate size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm mb-1">{template.name}</h3>
                                <p className="text-xs text-zinc-400">{template.description}</p>
                                <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider">{template.questions_count} Perguntas</p>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="col-span-2 py-8 text-center text-zinc-500 border border-dashed border-white/5 rounded-xl">
                        Nenhum template personalizado encontrado.
                    </div>
                )
            )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-white/10">
            <button
                onClick={handleContinue}
                disabled={!selectedType || loading}
                className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-black px-6 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
            >
                {loading ? "Carregando..." : "Continuar"}
            </button>
        </div>

      </div>
    </Modal>
  );
}
