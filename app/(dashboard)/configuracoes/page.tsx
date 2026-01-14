"use client";

import { useState } from "react";
import { User, CreditCard, Smartphone, Bell, Link as LinkIcon, Shield, Upload, Copy, ChevronLeft, AlertCircle, Plus, Check, RefreshCw } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "subscription", label: "Assinatura", icon: CreditCard },
    { id: "mobile", label: "Mobile", icon: Smartphone },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "integrations", label: "Integrações", icon: LinkIcon },
  ];

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
        <p className="text-zinc-400">Personalize sua experiência no DGFlow</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-900 p-1 rounded-xl border border-white/10 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative",
                isActive ? "text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/10 rounded-lg border border-white/5"
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "subscription" && <SubscriptionSettings />}
          {activeTab === "mobile" && <MobileSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "integrations" && <IntegrationSettings />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- TAB COMPONENTS ---

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

function ProfileSettings() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue } = useForm();

  // Load real data
  useEffect(() => {
    async function loadProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (profile) {
                setValue('full_name', profile.full_name);
                setValue('phone', profile.phone);
                // Add more fields if DB supports them
            }
        }
    }
    loadProfile();
  }, [setValue]);

  const onSubmit = async (data: any) => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
          const { error } = await supabase.from('profiles').update({
              full_name: data.full_name,
              phone: data.phone,
              updated_at: new Date().toISOString()
          }).eq('id', user.id);

          if (!error) alert("Perfil atualizado com sucesso!");
          else alert("Erro ao atualizar perfil.");
      }
      setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
             <User size={24} />
          </div>
          <div>
             <h3 className="text-lg font-semibold text-white">Perfil</h3>
             <p className="text-sm text-zinc-400">Informações pessoais e profissionais</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Nome Completo</label>
                <input {...register("full_name")} className="w-full bg-zinc-950 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500/50" />
            </div>
            
            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Telefone</label>
                <input {...register("phone")} className="w-full bg-zinc-950 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500/50" />
            </div>
        </div>

        <div className="mt-8 flex justify-end">
            <button 
                type="submit" 
                disabled={loading}
                className="bg-linear-to-r from-pink-500 to-orange-500 hover:opacity-90 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-pink-500/20 disabled:opacity-50"
            >
                {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
        </div>
      </div>
    </form>
  );
}

function SubscriptionSettings() {
  return (
    <div className="space-y-6">
       <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                <CreditCard size={24} />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white">Status da Assinatura</h3>
                <p className="text-sm text-zinc-400">Gerencie sua assinatura e acesso o DGFlow</p>
            </div>
        </div>

        <div className="bg-zinc-950/50 rounded-xl p-6 border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-1">Status</label>
                    <div className="flex items-center gap-2 text-green-500 font-bold">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        Ativo
                    </div>
                </div>
                <span className="bg-pink-500/20 text-pink-500 text-xs font-bold px-3 py-1 rounded-full">Trial Gratuito</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-1">Plano Atual</label>
                    <p className="text-white font-medium">Plano Pro (Trial)</p>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-1">Dias Restantes</label>
                    <p className="text-white font-medium flex items-center gap-2">
                        7 dias
                        <span className="text-xs text-zinc-500 font-normal">(Expira em 15 de Jan)</span>
                    </p>
                 </div>
            </div>
        </div>
        
        {/* Upgrade Banner */}
        <div className="mt-6 bg-linear-to-br from-zinc-800 to-zinc-900 border border-white/10 rounded-xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-all group-hover:bg-pink-500/20 duration-1000"></div>
            
            <div className="relative z-10">
                <h4 className="text-xl font-bold text-white mb-2">Aproveite o Trial Gratuito</h4>
                <p className="text-zinc-400 mb-6 max-w-lg">Você está no período de teste. Assine agora para garantir acesso ininterrupto a todas as features premium de gestão.</p>
                
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 text-sm text-zinc-300">
                    {['CRM para Designers', 'Gestão de Orçamentos', 'Pipelines Ilimitados', 'Fluxo de Caixa'].map(item => (
                        <li key={item} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-[10px] font-bold">✓</div>
                            {item}
                        </li>
                    ))}
                </ul>

                <button className="bg-linear-to-r from-pink-500 to-orange-500 hover:opacity-90 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-pink-500/20 w-full md:w-auto transition-all">
                    Ver Planos Disponíveis
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

function MobileSettings() {
    const shortcuts = [
        { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
        { id: 'clients', label: 'Clientes', icon: 'Users' },
        { id: 'pipelines', label: 'Pipelines', icon: 'Kanban' },
        { id: 'tasks', label: 'Tarefas', icon: 'CheckSquare' },
        { id: 'agenda', label: 'Agenda', icon: 'Calendar' },
        { id: 'finance', label: 'Financeiro', icon: 'DollarSign' },
        { id: 'services', label: 'Serviços', icon: 'Package' },
        { id: 'proposals', label: 'Orçamentos', icon: 'FileText' },
        { id: 'pages', label: 'Páginas', icon: 'Globe' },
    ];
    // In a real app we would map icons properly. Using placeholders for simplicity if needed or importing all.
    
    return (
     <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                <Smartphone size={24} />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white">Menu Mobile Flutuante</h3>
                <p className="text-sm text-zinc-400">Escolha até 4 atalhos para aparecer no menu inferior do mobile</p>
            </div>
        </div>

        <div className="bg-zinc-950/50 p-6 rounded-xl border border-white/5 mb-8">
            <h4 className="text-sm font-medium text-white mb-4">Atalhos Selecionados (4/4)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Dashboard', 'Clientes', 'Pipelines', 'Financeiro'].map(item => (
                    <div key={item} className="bg-pink-500/10 border border-pink-500/30 p-4 rounded-lg flex flex-col items-center justify-center gap-2 text-pink-500 cursor-pointer hover:bg-pink-500/20 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center font-bold">{item[0]}</div>
                        <span className="text-xs font-semibold">{item}</span>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             {/* Creating a visual representation of all options - keeping it static for MVP visual */}
             {['Tarefas', 'Agenda', 'Serviços', 'Orçamentos', 'Páginas', 'Configurações'].map(item => (
                 <div key={item} className="bg-zinc-800/30 border border-white/5 p-4 rounded-lg flex flex-col items-center justify-center gap-2 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer group">
                      <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center">{item[0]}</div>
                      <span className="text-xs font-medium">{item}</span>
                 </div>
             ))}
        </div>

        <div className="mt-8">
            <button className="w-full bg-linear-to-r from-pink-500 to-orange-500 hover:opacity-90 text-white font-bold py-3 rounded-xl shadow-lg shadow-pink-500/20 transition-all">
                Salvar Menu
            </button>
        </div>
     </div>
    );
}

function NotificationSettings() {
    return (
     <div className="space-y-6">
       <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                    <Bell size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Resumo Diário</h3>
                    <p className="text-sm text-zinc-400">Receba um resumo com tarefas pendentes e faturamento do dia</p>
                </div>
            </div>
            <Toggle active />
         </div>

         <div className="bg-zinc-950/50 p-6 rounded-xl border border-white/5 border-l-4 border-l-pink-500">
             <h4 className="text-sm font-bold text-white mb-2">O que você receberá:</h4>
             <ul className="space-y-2 text-sm text-zinc-400">
                 <li className="flex items-center gap-2">📝 Quantidade de tarefas pendentes para o dia</li>
                 <li className="flex items-center gap-2">💰 Quanto faturou no dia anterior</li>
                 <li className="flex items-center gap-2">📊 Resumo rápido de leads e orçamentos</li>
             </ul>
         </div>
       </div>

       <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
           <h3 className="text-lg font-semibold text-white mb-6">Notificações por Email/Push</h3>
           <div className="space-y-6">
                {[
                    { label: 'Novos Leads', desc: 'Seja notificado quando receber um novo lead' },
                    { label: 'Propostas Abertas', desc: 'Quando um cliente visualiza uma proposta' },
                    { label: 'Prazos Próximos', desc: 'Alerta 2 dias antes do deadline' },
                    { label: 'Pagamentos Recebidos', desc: 'Confirmação de pagamentos' },
                    { label: 'Insights da IA', desc: 'Dicas e sugestões semanais' }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between pb-4 border-b border-white/5 last:border-0 last:pb-0">
                        <div>
                            <p className="font-medium text-white">{item.label}</p>
                            <p className="text-sm text-zinc-400">{item.desc}</p>
                        </div>
                        <Toggle active />
                    </div>
                ))}
           </div>
       </div>
     </div>
    );
}

function IntegrationSettings() {
    const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

    const integrations = [
        { name: 'Google Calendar', connected: false, color: 'text-blue-500', icon: 'Calendar' },
        { name: 'Asaas', connected: false, color: 'text-blue-600', icon: 'CreditCard' },
        { name: 'Webhooks', connected: true, color: 'text-green-500', icon: 'Webhook' },
        { name: 'WhatsApp', connected: false, color: 'text-green-400', icon: 'MessageCircle' },
        { name: 'Notion', connected: false, color: 'text-white', icon: 'FileText' },
        { name: 'Google Drive', connected: false, color: 'text-yellow-500', icon: 'HardDrive' },
        { name: 'Slack', connected: false, color: 'text-purple-400', icon: 'Hash' },
        { name: 'Stripe', connected: false, color: 'text-indigo-400', icon: 'CreditCard' },
    ];

    if (selectedIntegration === 'Webhooks') {
        return <WebhookDetails onBack={() => setSelectedIntegration(null)} />;
    }

    if (selectedIntegration === 'Google Calendar') {
        return <CalendarDetails onBack={() => setSelectedIntegration(null)} />;
    }

    return (
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                    <LinkIcon size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Integrações</h3>
                    <p className="text-sm text-zinc-400">Conecte o DGFlow às suas ferramentas favoritas</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {integrations.map((app) => (
                    <div 
                        key={app.name} 
                        onClick={() => setSelectedIntegration(app.name)}
                        className={clsx(
                            "p-6 rounded-xl border border-white/5 bg-zinc-950/50 flex flex-col items-center justify-center gap-4 hover:bg-white/5 transition-colors group cursor-pointer relative overflow-hidden",
                            app.connected && "border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
                        )}
                    >
                        {app.connected && (
                            <div className="absolute top-3 right-3 text-green-500">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </div>
                        )}
                        <div className={clsx("w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center text-2xl font-bold", app.color)}>
                            {app.name[0]}
                        </div>
                        <div className="text-center">
                            <h4 className="font-medium text-white">{app.name}</h4>
                            <p className="text-xs text-zinc-500 mt-1">
                                {app.connected ? 'Conectado' : 'Desconectado'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
             
             <div className="mt-8 bg-zinc-950 border border-white/10 rounded-xl p-8 text-center">
                 <h4 className="text-lg font-medium text-white mb-2">Não encontrou a integração que precisa?</h4>
                 <p className="text-zinc-400 text-sm mb-6">Envie sua sugestão e nossa equipe técnica avaliará para futuras versões.</p>
                 <button className="border border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white px-6 py-2 rounded-lg text-sm font-bold transition-all">
                     Sugerir Integração
                 </button>
             </div>
        </div>
    );
}

function WebhookDetails({ onBack }: { onBack: () => void }) {
    return (
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 min-h-[400px]">
             {/* Header */}
             <div className="mb-6">
                <button 
                    onClick={onBack}
                    className="mb-4 text-zinc-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
                >
                    <ChevronLeft size={16} /> Voltar para Integrações
                </button>
             </div>

             <div className="bg-zinc-950 border border-white/10 rounded-xl p-8 max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                        <LinkIcon size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Webhooks</h3>
                        <p className="text-zinc-400">Capture leads de formulários externos</p>
                    </div>
                </div>

                {/* Alert */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8 flex gap-3 text-blue-400">
                     <AlertCircle size={20} className="shrink-0 mt-0.5" />
                     <p className="text-sm leading-relaxed">
                        Crie webhooks para receber leads automaticamente de qualquer formulário externo. Configure a URL no seu formulário e os leads serão capturados.
                     </p>
                </div>

                {/* Create Form */}
                <div className="bg-zinc-900/50 rounded-lg p-4 mb-8 flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Nome do webhook (ex: Landing Page)"
                        className="flex-1 bg-zinc-950 border border-white/10 rounded-lg px-4 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-zinc-600"
                    />
                    <button className="bg-linear-to-r from-pink-500 to-orange-500 text-white w-10 h-10 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity">
                        <Plus size={20} />
                    </button>
                </div>

                {/* Empty State */}
                <div className="py-12 flex flex-col items-center justify-center text-zinc-500">
                    <LinkIcon size={48} className="mb-4 opacity-20" />
                    <p className="font-medium">Nenhum webhook criado ainda</p>
                </div>
             </div>
        </div>
    );
}

function CalendarDetails({ onBack }: { onBack: () => void }) {
    return (
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 min-h-[400px]">
             {/* Header */}
             <div className="mb-6">
                <button 
                    onClick={onBack}
                    className="mb-4 text-zinc-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
                >
                    <ChevronLeft size={16} /> Voltar para Integrações
                </button>
             </div>

             <div className="bg-zinc-950 border border-white/10 rounded-xl p-8 max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <span className="font-bold text-lg">31</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Google Calendar</h3>
                        <p className="text-zinc-400">Sincronize suas tarefas automaticamente</p>
                    </div>
                </div>

                {/* Alert */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8 flex gap-3 text-blue-400">
                     <AlertCircle size={20} className="shrink-0 mt-0.5" />
                     <p className="text-sm leading-relaxed">
                        Ao conectar, suas tarefas com prazo serão sincronizadas automaticamente com seu Google Calendar.
                     </p>
                </div>

                {/* Benefits */}
                <div className="mb-8">
                     <h4 className="text-white font-medium mb-4">Benefícios da integração:</h4>
                     <ul className="space-y-3">
                        {[
                            'Tarefas aparecem no seu calendário',
                            'Receba notificações do Google',
                            'Sincronização automática'
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-2 text-zinc-400">
                                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                <span className="text-sm">{item}</span>
                            </li>
                        ))}
                     </ul>
                </div>

                {/* Connect Button */}
                <button className="w-full bg-linear-to-r from-pink-500 to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-pink-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-2">
                    <RefreshCw size={18} />
                    Conectar Google Calendar
                </button>
             </div>
        </div>
    );
}

// --- UI HELPERS ---

function Input({ label, placeholder, defaultValue, type = "text" }: { label: string, placeholder?: string, defaultValue?: string, type?: string }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">{label}</label>
            <input 
                type={type} 
                defaultValue={defaultValue} 
                placeholder={placeholder}
                className="w-full bg-zinc-950 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-zinc-600"
            />
        </div>
    );
}

function Select({ label, description, defaultValue }: { label: string, description?: string, defaultValue?: string }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">{label}</label>
             {description && <p className="text-xs text-zinc-500 mb-2">{description}</p>}
            <div className="relative">
                <select 
                    defaultValue={defaultValue}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg p-3 text-white appearance-none focus:outline-none focus:border-pink-500/50"
                >
                    <option>{defaultValue}</option>
                    <option>USD - Dólar Americano</option>
                    <option>EUR - Euro</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">▼</div>
            </div>
        </div>
    );
}

function Toggle({ active = false }: { active?: boolean }) {
    const [isOn, setIsOn] = useState(active);
    return (
        <button 
            onClick={() => setIsOn(!isOn)}
            className={clsx(
                "w-12 h-6 rounded-full relative transition-colors duration-300",
                isOn ? "bg-pink-500" : "bg-zinc-700"
            )}
        >
            <div className={clsx(
                "w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-md",
                isOn ? "left-7" : "left-1"
            )} />
        </button>
    );
}
