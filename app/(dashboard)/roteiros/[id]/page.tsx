"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    Save, ArrowLeft, Clock, Film, Mic, 
    Plus, Trash2, CheckCircle2, 
    Lightbulb, Copy 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetTrigger 
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- Types ---

interface SceneBlock {
    id: string;
    type: 'scene';
    visual: string;
    audio: string;
    is_done: boolean;
}

interface ScriptData {
    id: string;
    title: string;
    status: 'draft' | 'filming' | 'editing' | 'done';
    content: SceneBlock[];
    estimated_time: string;
}

const VIRAL_HOOKS = [
    { title: "Quebra de Padrão", text: "Pare de fazer isso agora se você quer..." },
    { title: "Curiosidade", text: "Você não vai acreditar no que eu descobri sobre..." },
    { title: "Promessa", text: "3 passos simples para dobrar seus resultados em..." },
    { title: "Controvérsia", text: "A verdade que ninguém te conta sobre..." },
    { title: "História", text: "Eu estava prestes a desistir quando..." },
];

export default function ScriptEditorPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [script, setScript] = useState<ScriptData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [estimatedSeconds, setEstimatedSeconds] = useState(0);

    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // --- Actions (Hoisted) ---

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const createBlock = (): SceneBlock => ({
        id: crypto.randomUUID(),
        type: 'scene',
        visual: '',
        audio: '',
        is_done: false
    });

    const saveToDb = async (data: ScriptData) => {
        setSaving(true);
        // Calculate latest time before saving to ensure consistency
        const totalWords = data.content.reduce((acc, block) => {
             const audioWords = block.audio ? block.audio.trim().split(/\s+/).length : 0;
             return acc + audioWords; 
        }, 0);
        const seconds = Math.ceil((totalWords / 150) * 60);
        const timeString = formatTime(seconds); // Use local function

        await supabase
            .from('scripts')
            .update({
                title: data.title,
                status: data.status,
                content: data.content,
                estimated_time: timeString,
                updated_at: new Date().toISOString()
            })
            .eq('id', data.id);
        
        setSaving(false);
    };

    const updateScript = (newData: ScriptData) => {
        setScript(newData);
        
        // Debounce Save
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(() => {
            saveToDb(newData);
        }, 2000);
    };

    const addBlock = () => {
        if (!script) return;
        updateScript({
            ...script,
            content: [...script.content, createBlock()]
        });
    };

    const removeBlock = (blockId: string) => {
        if (!script) return;
        if (script.content.length <= 1) return; // Keep at least one
        updateScript({
            ...script,
            content: script.content.filter(b => b.id !== blockId)
        });
    };

    const updateBlock = (blockId: string, field: keyof SceneBlock, value: string | boolean) => {
        if (!script) return;
        const newContent = script.content.map(b => 
            b.id === blockId ? { ...b, [field]: value } : b
        );
        updateScript({ ...script, content: newContent });
    };

    // --- Helpers ---

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // --- Init ---

    useEffect(() => {
        async function fetchScript() {
            setLoading(true);
            const { data, error } = await supabase
                .from('scripts')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) {
                console.error("Error fetching script:", error);
                router.push('/roteiros'); // Fail safe
            } else {
                // Ensure content is array
                const content = Array.isArray(data.content) ? data.content : [];
                if (content.length === 0) {
                    // Initialize with 1 empty block
                    content.push(createBlock());
                }
                setScript({ ...data, content });
            }
            setLoading(false);
        }
        fetchScript();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, router]); // Removed createBlock dependency as it's stable but defined in component

    // --- Time Calculation Effect ---

    useEffect(() => {
        if (!script) return;
        
        const totalWords = script.content.reduce((acc, block) => {
            const audioWords = block.audio ? block.audio.trim().split(/\s+/).length : 0;
            return acc + audioWords; 
        }, 0);

        const seconds = Math.ceil((totalWords / 150) * 60);
        setEstimatedSeconds(seconds);

    }, [script]); // Added full script as dependency to permit effect

    if (loading || !script) {
        return <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">Carregando Editor...</div>;
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
            {/* Toolbar */}
            <div className="h-16 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 lg:px-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/roteiros')}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="h-6 w-px bg-white/10" />
                    <Input 
                        value={script.title}
                        onChange={(e) => updateScript({ ...script, title: e.target.value })}
                        className="bg-transparent border-none text-lg font-bold w-64 focus-visible:ring-0 px-0"
                        placeholder="Título do Roteiro..."
                    />
                </div>

                <div className="flex items-center gap-4">
                    {/* Time Counter */}
                    <div className="bg-primary-500/10 text-primary-500 px-3 py-1.5 rounded-lg flex items-center gap-2 font-mono font-bold text-sm border border-primary-500/20">
                        <Clock size={16} />
                        {formatTime(estimatedSeconds)}
                    </div>

                    <Select 
                        value={script.status} 
                        onValueChange={(val: 'draft' | 'filming' | 'editing' | 'done') => updateScript({ ...script, status: val })}
                    >
                        <SelectTrigger className="w-32 bg-zinc-900 border-white/10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                            <SelectItem value="draft">Rascunho</SelectItem>
                            <SelectItem value="filming">Gravando</SelectItem>
                            <SelectItem value="editing">Editando</SelectItem>
                            <SelectItem value="done">Pronto</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="text-xs text-zinc-500 font-medium w-20 text-right">
                        {saving ? "Salvando..." : "Salvo"}
                    </div>

                    {/* Ideas Drawer Trigger */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="border-white/10 hover:bg-white/5 hidden lg:flex">
                                <Lightbulb size={18} className="mr-2 text-yellow-500" /> Ideias
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="bg-zinc-950 border-white/10 text-white">
                            <SheetHeader>
                                <SheetTitle className="text-white flex items-center gap-2">
                                    <Lightbulb size={20} className="text-yellow-500" /> Banco de Hooks
                                </SheetTitle>
                            </SheetHeader>
                            <ScrollArea className="h-[calc(100vh-100px)] mt-6 pr-4">
                                <div className="space-y-4">
                                    {VIRAL_HOOKS.map((hook, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-primary-500/30 transition-colors group cursor-copy"
                                            onClick={() => {
                                                navigator.clipboard.writeText(hook.text);
                                            }}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold uppercase text-primary-500 tracking-wider text-[10px]">{hook.title}</span>
                                                <Copy size={14} className="text-zinc-600 group-hover:text-primary-500" />
                                            </div>
                                            <p className="text-sm text-zinc-300 leading-relaxed font-medium">&quot;{hook.text}&quot;</p>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 max-w-5xl mx-auto w-full p-6 lg:p-10 space-y-2">
                {/* Column Headers */}
                <div className="grid grid-cols-[1fr_1fr_40px] gap-6 mb-4 px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><Film size={14} /> Cena / Visual</div>
                    <div className="flex items-center gap-2"><Mic size={14} /> Áudio / Fala</div>
                    <div></div>
                </div>

                {/* Blocks */}
                {script.content.map((block) => (
                    <div key={block.id} className={cn(
                        "group grid grid-cols-[1fr_1fr_40px] gap-6 items-start p-4 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/5 transition-all text-sm",
                        block.is_done && "opacity-50 grayscale hover:grayscale-0"
                    )}>
                        {/* Visual Column */}
                        <Textarea 
                            placeholder="Descreva a cena... (ex: Close no rosto, B-roll de escritório)"
                            value={block.visual}
                            onChange={(e) => updateBlock(block.id, 'visual', e.target.value)}
                            className="bg-transparent border-none resize-none focus-visible:ring-0 p-0 text-zinc-300 placeholder:text-zinc-700 min-h-[80px]"
                        />

                        {/* Audio Column */}
                        <Textarea 
                            placeholder="Escreva o que será dito..."
                            value={block.audio}
                            onChange={(e) => updateBlock(block.id, 'audio', e.target.value)}
                            className="bg-transparent border-none resize-none focus-visible:ring-0 p-0 text-white font-medium placeholder:text-zinc-700 min-h-[80px]"
                        />

                        {/* Actions */}
                        <div className="flex flex-col gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                className={cn("h-8 w-8", block.is_done ? "text-emerald-500" : "text-zinc-600 hover:text-emerald-500")}
                                onClick={() => updateBlock(block.id, 'is_done', !block.is_done)}
                            >
                                <CheckCircle2 size={18} />
                            </Button>
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-zinc-600 hover:text-red-500"
                                onClick={() => removeBlock(block.id)}
                            >
                                <Trash2 size={18} />
                            </Button>
                        </div>
                    </div>
                ))}

                {/* Add Button */}
                <div className="pt-4 flex justify-center">
                    <Button 
                        variant="ghost" 
                        onClick={addBlock}
                        className="text-zinc-500 hover:text-white hover:bg-white/5 w-full h-12 border border-dashed border-white/10 rounded-xl"
                    >
                        <Plus className="mr-2" /> Adicionar Cena
                    </Button>
                </div>
            </div>
        </div>
    );
}
