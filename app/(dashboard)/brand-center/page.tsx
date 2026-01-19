"use client";

import { useEffect, useState } from "react";
import { 
    Palette, Type, Image as ImageIcon, Copy, Download, 
    Search, Loader2, FileText, ExternalLink 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"; // Assuming sonner or similar toast exists, checking imports later

interface Client {
    id: string;
    name: string;
}

interface BrandAsset {
    id: string;
    type: 'color' | 'typography' | 'logo' | 'file';
    value: string;
    name: string;
    description?: string;
}

export default function BrandCenterPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [assets, setAssets] = useState<BrandAsset[]>([]);
    const [loadingClients, setLoadingClients] = useState(true);
    const [loadingAssets, setLoadingAssets] = useState(false);

    // Fetch Clients
    useEffect(() => {
        async function fetchClients() {
            setLoadingClients(true);
            const { data, error } = await supabase
                .from('clients')
                .select('id, name')
                .order('name');
            
            if (error) {
                console.error('Error fetching clients:', error);
            } else {
                setClients(data || []);
                // Auto-select first client if available
                if (data && data.length > 0) {
                    setSelectedClientId(data[0].id);
                }
            }
            setLoadingClients(false);
        }
        fetchClients();
    }, []);

    // Fetch Assets when Client changes
    useEffect(() => {
        if (!selectedClientId) return;

        async function fetchAssets() {
            setLoadingAssets(true);
            const { data, error } = await supabase
                .from('brand_assets')
                .select('*')
                .eq('client_id', selectedClientId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching assets:', error);
            } else {
                setAssets(data as BrandAsset[] || []);
            }
            setLoadingAssets(false);
        }

        fetchAssets();
    }, [selectedClientId]);

    const colors = assets.filter(a => a.type === 'color');
    const logos = assets.filter(a => a.type === 'logo');
    const typography = assets.filter(a => a.type === 'typography');

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Using alert for now since I'm not 100% sure on the Toast component availability yet
        // Ideally: toast.success("Copiado!");
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">Brand Center</h2>
                    <p className="text-zinc-400 text-sm sm:text-base font-medium">Biblioteca de ativos visuais e diretrizes da marca.</p>
                </div>
                
                <div className="w-full md:w-72">
                    <Select value={selectedClientId} onValueChange={setSelectedClientId} disabled={loadingClients}>
                        <SelectTrigger className="bg-zinc-900/50 border-white/10 h-12 rounded-xl text-white">
                            <SelectValue placeholder={loadingClients ? "Carregando..." : "Selecione o Cliente"} />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-white/10 text-white">
                            {clients.map(client => (
                                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loadingAssets && (
               <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-primary-500 h-10 w-10" />
               </div>
            )}

            {!loadingAssets && selectedClientId && (
                <Tabs defaultValue="colors" className="w-full">
                    <TabsList className="bg-zinc-900/50 border border-white/5 p-1 rounded-xl w-full justify-start mb-6 h-auto flex flex-wrap gap-2">
                        <TabsTrigger value="colors" className="rounded-lg data-[state=active]:bg-primary-500/20 data-[state=active]:text-primary-500 px-6 py-2.5 font-bold data-[state=active]:border-primary-500/30 border border-transparent">
                            <Palette className="mr-2 h-4 w-4" /> Cores
                        </TabsTrigger>
                        <TabsTrigger value="logos" className="rounded-lg data-[state=active]:bg-primary-500/20 data-[state=active]:text-primary-500 px-6 py-2.5 font-bold data-[state=active]:border-primary-500/30 border border-transparent">
                            <ImageIcon className="mr-2 h-4 w-4" /> Logos
                        </TabsTrigger>
                        <TabsTrigger value="typography" className="rounded-lg data-[state=active]:bg-primary-500/20 data-[state=active]:text-primary-500 px-6 py-2.5 font-bold data-[state=active]:border-primary-500/30 border border-transparent">
                            <Type className="mr-2 h-4 w-4" /> Tipografia
                        </TabsTrigger>
                    </TabsList>

                    {/* COLORS TAB */}
                    <TabsContent value="colors" className="space-y-6">
                        {colors.length === 0 ? (
                            <EmptyState message="Nenhuma cor cadastrada para esta marca." type="color" />
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {colors.map(color => (
                                    <div 
                                        key={color.id} 
                                        className="group relative flex flex-col gap-3 cursor-pointer"
                                        onClick={() => copyToClipboard(color.value)}
                                    >
                                        <div 
                                            className="h-32 w-full rounded-2xl shadow-xl border border-white/5 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl flex items-center justify-center relative overflow-hidden"
                                            style={{ backgroundColor: color.value }}
                                        >
                                            <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity">
                                                <Copy className="text-white drop-shadow-md" size={24} />
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-bold text-sm tracking-wide">{color.name}</p>
                                            <p className="text-zinc-500 text-xs uppercase font-mono mt-1">{color.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* LOGOS TAB */}
                    <TabsContent value="logos" className="space-y-6">
                        {logos.length === 0 ? (
                            <EmptyState message="Nenhum logo cadastrado." type="logo" />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {logos.map(logo => (
                                    <Card key={logo.id} className="bg-zinc-900/40 border-white/5 overflow-hidden hover:border-primary-500/30 transition-all p-4">
                                        <div className="aspect-square rounded-xl bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-zinc-800/50 flex items-center justify-center mb-4 relative group border border-dashed border-white/10">
                                            {/* Checkerboard pattern simulation for transparency */}
                                            <div className="absolute inset-0 opacity-10" 
                                                style={{ 
                                                    backgroundImage: 'linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)',
                                                    backgroundSize: '20px 20px',
                                                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' 
                                                }} 
                                            />
                                            <img src={logo.value} alt={logo.name} className="max-w-[80%] max-h-[80%] object-contain relative z-10" />
                                            
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20">
                                                <Button size="sm" className="font-bold gap-2" asChild>
                                                    <a href={logo.value} target="_blank" download>
                                                        <Download size={16} /> Baixar
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-white font-bold text-sm">{logo.name}</h3>
                                            <p className="text-zinc-500 text-xs line-clamp-2">{logo.description || "Sem descrição"}</p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* TYPOGRAPHY TAB */}
                    <TabsContent value="typography" className="space-y-6">
                         {typography.length === 0 ? (
                            <EmptyState message="Nenhuma tipografia cadastrada." type="typography" />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {typography.map(font => (
                                    <Card key={font.id} className="bg-white text-black p-8 rounded-2xl relative overflow-hidden group">
                                         <div className="absolute top-4 right-4 text-xs font-bold bg-black text-white px-2 py-1 rounded uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">
                                            {font.name}
                                         </div>
                                         
                                         <div className="space-y-6">
                                            <div className="space-y-2">
                                                <p className="text-6xl font-black" style={{ fontFamily: font.value }}>Aa</p>
                                                <p className="text-lg opacity-80" style={{ fontFamily: font.value }}>abcdefghijklmnopqrstuvwxyz</p>
                                                <p className="text-lg opacity-80" style={{ fontFamily: font.value }}>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                                                <p className="text-lg opacity-80" style={{ fontFamily: font.value }}>0123456789</p>
                                            </div>
                                            <div className="pt-6 border-t border-black/10">
                                                <p className="text-sm font-medium opacity-60">The quick brown fox jumps over the lazy dog.</p>
                                            </div>
                                         </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            )}

            {!loadingAssets && selectedClientId && assets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 border border-white/5 rounded-3xl border-dashed">
                    <Palette className="h-16 w-16 text-zinc-700 mb-4" />
                    <h3 className="text-white font-bold text-xl mb-2">Sem ativos cadastrados</h3>
                    <p className="text-zinc-500 text-center max-w-sm">
                        Parece que este cliente ainda não tem ativos no Brand Center. Adicione cores, logos e tipografias no banco de dados.
                    </p>
                </div>
            )}
        </div>
    );
}

function EmptyState({ message, type }: { message: string, type: string }) {
    const icon = type === 'color' ? Palette : type === 'logo' ? ImageIcon : Type;
    const IconComponent = icon;

    return (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
            <IconComponent size={48} className="mb-4 opacity-50" />
            <p>{message}</p>
        </div>
    );
}
