"use client";

import { useState, useEffect } from "react";
import { User, Smartphone, Bell, Link as LinkIcon, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, SubmitHandler } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "mobile", label: "Mobile", icon: Smartphone },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "integrations", label: "Integrações", icon: LinkIcon },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-5xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">Configurações</h1>
        <p className="text-zinc-400 text-sm">Personalize sua experiência no DGFlow</p>
      </div>

      {/* Tabs - Scrollable on Mobile */}
      <div className="flex bg-zinc-900/60 p-1.5 rounded-xl border border-white/5 w-full sm:w-fit gap-1 overflow-x-auto custom-scrollbar no-scrollbar">
        <div className="flex gap-1 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all relative group",
                isActive ? "text-primary-500" : "text-zinc-400 hover:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary-500/10 rounded-lg border border-primary-500/20"
                />
              )}
              <Icon size={16} className="relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-[400px]"
        >
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "mobile" && <MobileSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "integrations" && <IntegrationSettings />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- TAB COMPONENTS ---

function ProfileSettings() {
  const [loading, setLoading] = useState(false);
  
  interface ProfileFormData {
    full_name: string;
    phone: string;
  }

  const { register, handleSubmit, setValue } = useForm<ProfileFormData>();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) {
          setValue('full_name', profile.full_name || '');
          setValue('phone', profile.phone || '');
        }
      }
    }
    loadProfile();
  }, [setValue]);

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase.from('profiles').update({
        full_name: data.full_name,
        phone: data.phone,
        updated_at: new Date().toISOString()
      }).eq('id', user.id);

      if (!error) {
          // Opção futura: Toast de sucesso
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 sm:p-8 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex items-center gap-4 mb-8 sm:mb-10 relative z-10">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20 shadow-lg shadow-primary-500/5">
             <User size={24} className="sm:size-7" />
          </div>
          <div>
             <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">Perfil</h3>
             <p className="text-xs sm:text-sm text-zinc-400">Informações da sua conta</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-3">
                <Label className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Nome Completo</Label>
                <Input 
                    {...register("full_name")} 
                    className="bg-zinc-950/50 border-white/5 h-12 text-white focus-visible:ring-primary-500/50" 
                    placeholder="Seu nome completo"
                />
            </div>
            
            <div className="space-y-3">
                <Label className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Telefone / WhatsApp</Label>
                <Input 
                    {...register("phone")} 
                    className="bg-zinc-950/50 border-white/5 h-12 text-white focus-visible:ring-primary-500/50" 
                    placeholder="(00) 00000-0000"
                />
            </div>
        </div>

        <div className="mt-12 flex justify-end relative z-10">
            <Button 
                type="submit" 
                disabled={loading}
                className="bg-primary-500 hover:bg-primary-600 text-black font-bold h-12 px-10 rounded-xl shadow-lg shadow-primary-500/20"
            >
                {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
        </div>
      </div>
    </form>
  );
}

function MobileSettings() {
    return (
     <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-8 backdrop-blur-sm">
        <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                <Smartphone size={28} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Menu Mobile Flutuante</h3>
                <p className="text-sm text-zinc-400">Personalize o acesso rápido inferior</p>
            </div>
        </div>

        <div className="bg-zinc-950/50 p-6 rounded-2xl border border-white/5 mb-10">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">Visualização do Menu (Atalhos Fixos)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Dashboard', 'Clientes', 'Pipelines', 'Financeiro'].map(item => (
                    <div key={item} className="bg-primary-500/5 border border-primary-500/20 p-5 rounded-xl flex flex-col items-center justify-center gap-3 text-primary-500 group transition-all hover:bg-primary-500/10">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center font-bold text-lg">{item[0]}</div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{item}</span>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Opções Disponíveis</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {['Tarefas', 'Agenda', 'Serviços', 'Orçamentos', 'Páginas', 'Configurações'].map(item => (
                     <div key={item} className="bg-zinc-900/20 border border-white/5 p-5 rounded-xl flex flex-col items-center justify-center gap-3 text-zinc-400 hover:border-primary-500/30 hover:text-white transition-all cursor-pointer group">
                          <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-primary-500/10 flex items-center justify-center text-lg">{item[0]}</div>
                          <span className="text-[10px] font-bold uppercase tracking-widest">{item}</span>
                     </div>
                 ))}
            </div>
        </div>

        <div className="mt-12">
            <Button className="w-full bg-primary-500 hover:bg-primary-600 text-black font-bold h-12 rounded-xl">
                Salvar Menu
            </Button>
        </div>
     </div>
    );
}

function NotificationSettings() {
    return (
     <div className="space-y-6">
       <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-8 backdrop-blur-sm">
         <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                    <Bell size={28} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Resumo Diário</h3>
                    <p className="text-sm text-zinc-400">Receba no WhatsApp as tarefas do dia</p>
                </div>
            </div>
            <Switch defaultChecked />
         </div>

         <div className="bg-primary-500/5 p-6 rounded-2xl border border-primary-500/10 border-l-4 border-l-primary-500">
             <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Relatório do Robô:</h4>
             <ul className="space-y-2 text-sm text-zinc-400">
                 <li className="flex items-center gap-2 font-medium">✨ Quantidade de tarefas pendentes</li>
                 <li className="flex items-center gap-2 font-medium">💰 Faturamento realizado no período</li>
                 <li className="flex items-center gap-2 font-medium">📊 Resumo rápido de novos orçamentos</li>
             </ul>
         </div>
       </div>

       <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-8 backdrop-blur-sm border-t border-t-white/5">
           <h3 className="text-xl font-bold text-white mb-10 tracking-tight">Alertas do Sistema</h3>
           <div className="space-y-8">
                {[
                    { label: 'Novos Leads', desc: 'Sinalizar quando um novo projeto for iniciado', icon: User },
                    { label: 'Propostas Visualizadas', desc: 'Notificar quando o cliente abrir um orçamento', icon: LinkIcon },
                    { label: 'Deadlines Próximos', desc: 'Alerta de prazos para entregas críticas', icon: Bell },
                    { label: 'Pagamentos', desc: 'Monitorar compensação de boletos e Pix', icon: RefreshCw }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-xl bg-zinc-950/50 flex items-center justify-center text-zinc-500 group-hover:text-primary-500 transition-colors border border-white/5">
                                <item.icon size={20} />
                             </div>
                             <div>
                                <p className="font-bold text-white leading-none mb-1">{item.label}</p>
                                <p className="text-xs text-zinc-500">{item.desc}</p>
                             </div>
                        </div>
                        <Switch />
                    </div>
                ))}
           </div>
       </div>
     </div>
    );
}

function IntegrationSettings() {
    const integrations = [
        { name: 'WhatsApp', connected: true, color: 'text-green-500', icon: 'MessageCircle', status: 'active' },
        { name: 'Google Calendar', connected: false, color: 'text-blue-500', icon: 'Calendar', status: 'coming_soon' },
        { name: 'Asaas', connected: false, color: 'text-blue-600', icon: 'CreditCard', status: 'coming_soon' },
        { name: 'Webhooks', connected: true, color: 'text-primary-500', icon: 'Zap', status: 'active' },
        { name: 'Stripe', connected: false, color: 'text-indigo-400', icon: 'CreditCard', status: 'coming_soon' },
        { name: 'Notion', connected: false, color: 'text-zinc-300', icon: 'FileText', status: 'coming_soon' },
        { name: 'Google Drive', connected: false, color: 'text-orange-500', icon: 'Folder', status: 'coming_soon' },
        { name: 'Figma', connected: false, color: 'text-purple-500', icon: 'Palette', status: 'coming_soon' },
        { name: 'Slack', connected: false, color: 'text-teal-500', icon: 'Slack', status: 'coming_soon' },
        { name: 'Zapier', connected: false, color: 'text-orange-600', icon: 'Zap', status: 'coming_soon' },
        { name: 'Calendly', connected: false, color: 'text-blue-400', icon: 'Clock', status: 'coming_soon' },
        { name: 'Behance', connected: false, color: 'text-blue-700', icon: 'Share2', status: 'coming_soon' },
    ];

    return (
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                    <LinkIcon size={28} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Conectividade</h3>
                    <p className="text-sm text-zinc-400">Integrações nativas e APIs de terceiros</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {integrations.map((app) => (
                    <div 
                        key={app.name} 
                        className={cn(
                            "p-6 rounded-2xl border border-white/5 bg-zinc-950/30 flex flex-col items-center justify-center gap-4 hover:border-primary-500/30 transition-all group cursor-pointer relative overflow-hidden",
                            app.status === 'active' && "border-primary-500/30 bg-primary-500/5",
                            app.status === 'coming_soon' && "opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                        )}
                    >
                        {app.status === 'active' && (
                            <div className="absolute top-4 right-4 text-primary-500">
                                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                            </div>
                        )}
                        {app.status === 'coming_soon' && (
                            <div className="absolute top-3 right-3">
                                <span className="text-[8px] font-black uppercase tracking-tighter bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-white/5">Em breve</span>
                            </div>
                        )}
                        <div className={cn("w-14 h-14 rounded-2xl bg-zinc-900/50 flex items-center justify-center text-3xl font-bold border border-white/5 group-hover:border-primary-500/20 transition-all", app.color)}>
                            {app.name[0]}
                        </div>
                        <div className="text-center">
                            <h4 className="font-bold text-white text-sm tracking-tight">{app.name}</h4>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">
                                {app.status === 'active' ? 'Ativo' : 'Offline'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
             
             <div className="mt-12 bg-primary-500/5 border border-dashed border-primary-500/20 rounded-2xl p-10 text-center relative group overflow-hidden">
                 <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                 <h4 className="text-lg font-bold text-white mb-2 relative z-10">Solicitar Nova Integração</h4>
                 <p className="text-zinc-500 text-sm mb-8 max-w-sm mx-auto relative z-10">Ficou faltando algo? Nossa engine de APIs está em constante expansão.</p>
                 <Button variant="outline" className="border-primary-500/50 text-primary-500 hover:bg-primary-500 hover:text-black font-bold h-10 px-8 relative z-10">
                     Abrir Ticket
                 </Button>
             </div>
        </div>
    );
}
