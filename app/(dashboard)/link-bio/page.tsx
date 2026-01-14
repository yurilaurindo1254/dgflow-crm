"use client";

import { useState } from "react";
import { 
  Smartphone, 
  Share2, 
  Plus, 
  GripVertical, 
  Trash2, 
  Eye, 
  Copy,
  Layout,
  Palette,
  Settings
} from "lucide-react";
import clsx from "clsx";
import { Modal } from "@/components/ui/modal";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

// Mock Data
const initialLinks = [
    { id: '1', title: 'Agendar Reunião', url: 'https://cal.com/me', active: true, clicks: 124 },
    { id: '2', title: 'Portfólio', url: 'https://myportfolio.com', active: true, clicks: 856 },
    { id: '3', title: 'WhatsApp', url: 'https://wa.me/5511999999999', active: true, clicks: 432 },
];

export default function LinkBioPage() {
    const [links, setLinks] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'links' | 'appearance' | 'settings'>('links');
    const [loading, setLoading] = useState(true);

    async function fetchLinks() {
        const { data } = await supabase.from('link_bio_links').select('*').order('created_at', { ascending: true });
        if (data) setLinks(data);
        setLoading(false);
    }

    useEffect(() => {
        fetchLinks();
    }, []);

    async function handleAddLink() {
        const title = prompt("Título do Link:");
        const url = prompt("URL do Link:");
        if (!title || !url) return;

        const { error } = await supabase.from('link_bio_links').insert([{ title, url, active: true }]);
        if (!error) fetchLinks();
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza?")) return;
        await supabase.from('link_bio_links').delete().eq('id', id);
        fetchLinks();
    }

    async function handleToggle(id: string, currentStatus: boolean) {
        await supabase.from('link_bio_links').update({ active: !currentStatus }).eq('id', id);
        fetchLinks();
    }

    return (
        <div className="h-full flex flex-col lg:flex-row gap-8">
            
            {/* Left: Editor */}
            <div className="flex-1 flex flex-col h-full bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden">
                {/* Header Actions */}
                <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Link na Bio</h2>
                        <p className="text-zinc-400 text-sm">Gerencie sua página pública e links.</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <button className="flex items-center gap-2 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-sm font-medium border border-transparent hover:border-white/10">
                            <Copy size={16} />
                            Copiar Link
                         </button>
                         <button className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-pink-500/20 transition-all">
                            <Share2 size={16} />
                            Compartilhar
                         </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 pt-4 flex items-center gap-6 border-b border-white/5 text-sm font-medium overflow-x-auto">
                    <button 
                        onClick={() => setActiveTab('links')}
                        className={clsx(
                            "pb-4 flex items-center gap-2 transition-colors border-b-2",
                            activeTab === 'links' ? "text-white border-pink-500" : "text-zinc-400 border-transparent hover:text-zinc-200"
                        )}
                    >
                        <Layout size={18} /> Links
                    </button>
                    <button 
                        onClick={() => setActiveTab('appearance')}
                        className={clsx(
                            "pb-4 flex items-center gap-2 transition-colors border-b-2",
                            activeTab === 'appearance' ? "text-white border-pink-500" : "text-zinc-400 border-transparent hover:text-zinc-200"
                        )}
                    >
                        <Palette size={18} /> Apariência
                    </button>
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={clsx(
                            "pb-4 flex items-center gap-2 transition-colors border-b-2",
                            activeTab === 'settings' ? "text-white border-pink-500" : "text-zinc-400 border-transparent hover:text-zinc-200"
                        )}
                    >
                        <Settings size={18} /> Configurações
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {activeTab === 'links' && (
                        <div className="space-y-4 max-w-2xl mx-auto">
                            <button onClick={handleAddLink} className="w-full bg-linear-to-r from-pink-500 to-orange-500 hover:opacity-90 text-white p-3 rounded-xl font-bold shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2">
                                <Plus size={20} />
                                Adicionar Novo Link
                            </button>

                            <div className="space-y-3 mt-6">
                                {links.map((link) => (
                                    <div key={link.id} className="group bg-zinc-950 border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:border-white/20 transition-all">
                                        <div className="text-zinc-600 cursor-grab hover:text-zinc-400">
                                            <GripVertical size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <input 
                                                value={link.title} 
                                                className="bg-transparent text-white font-medium focus:outline-none w-full mb-1"
                                                readOnly
                                            />
                                            <p className="text-zinc-500 text-xs truncate max-w-[300px]">{link.url}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md">
                                                <Eye size={12} />
                                                {link.clicks}
                                            </div>
                                            <div onClick={() => handleToggle(link.id, link.active)} className="w-10 h-6 bg-zinc-800 rounded-full relative cursor-pointer hover:bg-zinc-700 transition-colors">
                                                <div className={clsx("absolute top-1 w-4 h-4 rounded-full transition-all", link.active ? "left-5 bg-green-500" : "left-1 bg-zinc-500")}></div>
                                            </div>
                                            <button onClick={() => handleDelete(link.id)} className="text-zinc-500 hover:text-red-500 transition-colors p-2 hover:bg-white/5 rounded-lg">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'appearance' && (
                        <div className="text-center text-zinc-500 py-12">
                            <Palette size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Configurações de aparência em breve...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Phone Preview */}
            <div className="hidden lg:flex flex-col items-center justify-center w-[400px] bg-zinc-950 rounded-3xl border border-white/10 p-8 relative shrink-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-xl z-10 border-b border-x border-white/5"></div>
                
                {/* Phone Screen Mockup */}
                <div className="w-full h-[700px] bg-black rounded-[2.5rem] border-8 border-zinc-900 overflow-hidden relative shadow-2xl">
                     {/* Preview Content */}
                     <div className="h-full w-full overflow-y-auto custom-scrollbar bg-linear-to-b from-zinc-900 to-black p-6 pt-16 text-center">
                        <div className="w-24 h-24 rounded-full bg-zinc-800 mx-auto mb-4 border-2 border-white/10 overflow-hidden">
                            {/* Avatar Placeholder */}
                            <div className="w-full h-full bg-linear-to-br from-pink-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">
                                D
                            </div>
                        </div>
                        <h3 className="text-white font-bold text-xl mb-1">DGFlow Agency</h3>
                        <p className="text-zinc-400 text-sm mb-8">@dgflow.agency</p>

                        <div className="space-y-4">
                            {links.filter(l => l.active).map(link => (
                                <a 
                                    key={link.id}
                                    href="#" 
                                    className="block w-full bg-zinc-800/50 backdrop-blur-sm border border-white/10 hover:bg-white/10 text-white p-4 rounded-xl font-medium transition-all transform hover:scale-[1.02]"
                                >
                                    {link.title}
                                </a>
                            ))}
                        </div>

                         <div className="mt-12 flex justify-center gap-4">
                            {/* Social Icons Placeholder */}
                            <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"></div>
                            <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"></div>
                            <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"></div>
                        </div>
                        
                        <div className="mt-8 text-xs text-zinc-600">
                             Feito com DGFlow
                        </div>
                     </div>
                </div>
            </div>

        </div>
    );
}
