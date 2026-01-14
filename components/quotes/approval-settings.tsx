"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Check, LayoutTemplate } from "lucide-react";
import NextImage from "next/image";

// Predefined Palettes
const PALETTES = [
    { name: "Neon Life", primary: "#84CC16", secondary: "#18181b" },
    { name: "Ocean Breeze", primary: "#3b82f6", secondary: "#0f172a" },
    { name: "Forest Mist", primary: "#10b981", secondary: "#022c22" },
    { name: "Royal Purple", primary: "#a855f7", secondary: "#3b0764" },
    { name: "Midnight Sun", primary: "#f59e0b", secondary: "#27272a" },
    { name: "Rose Gold", primary: "#fb7185", secondary: "#4c0519" },
];

interface BrandingSettings {
    primary: string;
    secondary: string;
    logo_url: string;
}

export function ApprovalSettings() {
  const [settings, setSettings] = useState<BrandingSettings>({
      primary: "#84CC16",
      secondary: "#18181b",
      logo_url: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
      async function fetchSettings() {
          const { data: quoteData } = await supabase.from('tenant_settings').select('*').single();
          if (quoteData) {
              setSettings({
                  primary: quoteData.branding_colors?.primary || "#79CD25",
                  secondary: quoteData.branding_colors?.secondary || "#18181b",
                  logo_url: quoteData.logo_url || ""
              });
          }
      }
      fetchSettings();
  }, []);

  const saveSettings = async () => {
      setSaving(true);
      const updates = {
          branding_colors: { primary: settings.primary, secondary: settings.secondary },
          logo_url: settings.logo_url,
          updated_at: new Date().toISOString()
      };
      
      const { data: existing } = await supabase.from('tenant_settings').select('id').limit(1).single();
      
      if (existing) {
          await supabase.from('tenant_settings').update(updates).eq('id', existing.id);
      } else {
          await supabase.from('tenant_settings').insert(updates);
      }
      setSaving(false);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 h-[calc(100vh-12rem)] min-h-[700px] animate-in fade-in slide-in-from-bottom-6 duration-700 p-1">
        
        {/* Left Panel: Configuration */}
        <div className="w-full xl:w-[400px] shrink-0 space-y-8 bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 overflow-y-auto shadow-2xl relative group">
            <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent rounded-3xl pointer-events-none" />
            
            <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-linear-to-br from-zinc-800 to-black rounded-lg border border-white/10 shadow-lg">
                        <LayoutTemplate size={20} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                        Identidade Visual
                    </h3>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                    Personalize a experiência de aprovação para seus clientes.
                </p>
            </div>

            <div className="space-y-5 relative">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Logotipo da Empresa</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1 group/input">
                            <Input 
                                value={settings.logo_url}
                                onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                                placeholder="https://exemplo.com/logo.png"
                                className="bg-black/20 border-white/10 text-white focus:border-primary-500/50 focus:ring-primary-500/50 pl-3 pr-10 transition-all font-mono text-xs"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] opacity-0 group-hover/input:opacity-100 transition-opacity" />
                        </div>
                        <Button variant="outline" size="icon" className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white">
                            <Upload size={16} />
                        </Button>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Paletas Premium</label>
                    <div className="grid grid-cols-2 gap-2">
                        {PALETTES.map((p, i) => (
                            <button
                                key={i}
                                onClick={() => setSettings({ ...settings, primary: p.primary, secondary: p.secondary })}
                                className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all text-left group/palette relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-linear-to-r from-white/5 to-transparent opacity-0 group-hover/palette:opacity-100 transition-opacity" />
                                <div className="flex -space-x-1 relative z-10">
                                    <div className="w-5 h-5 rounded-full ring-2 ring-black shadow-lg" style={{ backgroundColor: p.primary }} />
                                    <div className="w-5 h-5 rounded-full ring-2 ring-black shadow-lg" style={{ backgroundColor: p.secondary }} />
                                </div>
                                <span className="text-xs font-medium text-zinc-400 group-hover/palette:text-white transition-colors relative z-10">{p.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ajuste Fino</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <span className="text-xs text-zinc-400">Cor Primária</span>
                            <div className="h-10 flex items-center gap-2 bg-black/40 p-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer group/color">
                                <div className="relative w-8 h-full rounded bg-zinc-800 overflow-hidden">
                                     <input 
                                        type="color" 
                                        value={settings.primary}
                                        onChange={(e) => setSettings({ ...settings, primary: e.target.value })}
                                        className="absolute -top-2 -left-2 w-16 h-16 p-0 border-none cursor-pointer opacity-0"
                                    />
                                    <div className="w-full h-full" style={{ backgroundColor: settings.primary }} />
                                </div>
                                <span className="text-xs text-zinc-300 font-mono group-hover/color:text-white transition-colors">{settings.primary}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <span className="text-xs text-zinc-400">Fundo / Secundária</span>
                            <div className="h-10 flex items-center gap-2 bg-black/40 p-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer group/color">
                                 <div className="relative w-8 h-full rounded bg-zinc-800 overflow-hidden">
                                     <input 
                                        type="color" 
                                        value={settings.secondary}
                                        onChange={(e) => setSettings({ ...settings, secondary: e.target.value })}
                                        className="absolute -top-2 -left-2 w-16 h-16 p-0 border-none cursor-pointer opacity-0"
                                    />
                                    <div className="w-full h-full" style={{ backgroundColor: settings.secondary }} />
                                </div>
                                <span className="text-xs text-zinc-300 font-mono group-hover/color:text-white transition-colors">{settings.secondary}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 mt-auto">
                <Button 
                    onClick={saveSettings}
                    disabled={saving}
                    className="w-full h-12 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Check className="mr-2" size={18} />}
                    {saving ? "Aplicando..." : "Salvar Alterações"}
                </Button>
            </div>
        </div>

        {/* Right Panel: Live Preview */}
        <div className="flex-1 bg-zinc-950 rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl flex flex-col">
            {/* Browser Header Mock */}
            <div className="bg-black/60 border-b border-white/5 px-6 py-4 flex items-center justify-between backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                     <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
                    </div>
                    <div className="h-8 px-4 bg-zinc-900/50 rounded-md flex items-center text-xs text-zinc-500 border border-white/5 min-w-[300px]">
                        <span className="opacity-50">https://</span>
                        <span className="text-zinc-400">propostas.dgflow.com/v/xp92-aa01</span>
                    </div>
                </div>
                <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest hidden md:block">Live Preview</span>
            </div>
            
            <div className="flex-1 bg-zinc-950 relative overflow-hidden font-sans selection:bg-(--preview-primary) selection:text-white"
                 style={{ 
                     '--preview-primary': settings.primary,
                     '--preview-secondary': settings.secondary
                 } as React.CSSProperties}
            >
                <div className="absolute inset-0 overflow-y-auto custom-scrollbar pb-20">
                    
                    {/* Header / Hero */}
                    <header className="relative w-full h-[280px] overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-(--preview-primary) opacity-20 blur-[100px]" />
                        <div className="absolute inset-0 bg-linear-to-b from-zinc-950/50 to-zinc-950" />
                        
                        <div className="relative z-10 text-center space-y-4 px-4">
                            <span className="inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs uppercase tracking-widest font-bold text-(--preview-secondary)" style={{ color: settings.secondary }}>
                                Proposta Comercial
                            </span>
                            {settings.logo_url ? (
                                <div className="relative h-12 w-full mb-4">
                                    <NextImage 
                                        src={settings.logo_url} 
                                        alt="Logo" 
                                        fill
                                        className="object-contain" 
                                        priority
                                    />
                                </div>
                            ) : null}
                            <h1 className="text-3xl md:text-4xl font-bold text-white max-w-xl mx-auto leading-tight">
                                Design de Identidade Visual
                            </h1>
                            <p className="text-sm text-zinc-400">Preparado para <span className="text-white font-medium">Acme Corp</span></p>
                        </div>
                    </header>

                    <div className="max-w-3xl mx-auto px-6 -mt-8 relative z-20 space-y-6">
                        
                        {/* Overview Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-zinc-900/50 backdrop-blur border border-white/5 p-4 rounded-xl flex flex-col items-center text-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-(--preview-primary)/20 text-(--preview-primary)" style={{ color: settings.primary, backgroundColor: `${settings.primary}33` }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                </div>
                                <span className="text-zinc-500 text-[10px] uppercase">Validade</span>
                                <strong className="text-white text-sm">30 Jan, 2026</strong>
                            </div>
                            <div className="bg-zinc-900/50 backdrop-blur border border-white/5 p-4 rounded-xl flex flex-col items-center text-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-(--preview-secondary)/20 text-(--preview-secondary)" style={{ color: settings.secondary, backgroundColor: `${settings.secondary}33` }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                </div>
                                <span className="text-zinc-500 text-[10px] uppercase">Prazo</span>
                                <strong className="text-white text-sm">15 dias</strong>
                            </div>
                            <div className="bg-zinc-900/50 backdrop-blur border border-white/5 p-4 rounded-xl flex flex-col items-center text-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                                </div>
                                <span className="text-zinc-500 text-[10px] uppercase">Total de Itens</span>
                                <strong className="text-white text-sm">3 itens inclusos</strong>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="bg-zinc-900/30 border border-white/5 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-white/5">
                                <h3 className="text-lg font-bold text-white">Investimento</h3>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                    <div>
                                        <h4 className="text-white font-medium text-sm">Criação de Logotipo</h4>
                                        <p className="text-zinc-500 text-xs">Conceito, variações e manual</p>
                                    </div>
                                    <span className="text-white font-bold text-sm">R$ 1.500,00</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                    <div>
                                        <h4 className="text-white font-medium text-sm">Identidade Visual</h4>
                                        <p className="text-zinc-500 text-xs">Papelaria, social media kit</p>
                                    </div>
                                    <span className="text-white font-bold text-sm">R$ 2.000,00</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="text-white font-medium text-sm">Website One-Page</h4>
                                        <p className="text-zinc-500 text-xs">Design e desenvolvimento</p>
                                    </div>
                                    <span className="text-white font-bold text-sm">R$ 3.500,00</span>
                                </div>
                            </div>
                            
                            {/* Financial Summary */}
                            <div className="bg-white/5 p-4 flex flex-col items-end gap-1">
                                <div className="flex justify-between w-full max-w-[200px] text-xs">
                                    <span className="text-zinc-400">Subtotal</span>
                                    <span className="text-white">R$ 7.000,00</span>
                                </div>
                                <div className="flex justify-between w-full max-w-[200px] pt-3 border-t border-white/10 mt-1">
                                    <span className="text-zinc-200 font-bold text-sm">Total</span>
                                    <span className="text-(--preview-primary) font-bold text-lg" style={{ color: settings.primary }}>R$ 7.000,00</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions Mock */}
                        <div className="flex justify-center pt-4 pb-8">
                             <div className="px-6 py-3 rounded-lg bg-(--preview-primary) text-white font-bold shadow-(--preview-primary)/20 flex items-center gap-2 transform scale-90 opacity-90 grayscale-[0.3]" style={{ backgroundColor: settings.primary, boxShadow: `0 10px 25px -5px ${settings.primary}40` }}>
                                <Check size={16} />
                                Aprovar Proposta
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}


