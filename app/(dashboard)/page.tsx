"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, DollarSign, Users, Briefcase, Calendar, TrendingDown, Target, Clock } from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { RevenueGoal } from "@/components/dashboard/revenue-goal";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/contexts/settings-context";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils/format";

export default function Home() {
  const { t, language, currency } = useSettings();
  const [metrics, setMetrics] = useState({
    monthlyRevenue: 0,
    monthlyExpenses: 0, // Mocked for now, or fetch if available
    netProfit: 0,
    newLeads: 0,
    activeProjects: 0,
    conversionRate: 18, // Mocked
    chartData: [] as { name: string; income: number; expense: number }[],
  });
  const [loading, setLoading] = useState(true);

  // Date range (mocked for visuals)
  const dateRange = "01 Jan 2026 - 31 Jan 2026";

  useEffect(() => {
    async function fetchData() {
        setLoading(true);
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            
            // 1. Revenue
            const { data: incomeTxets, error: incomeError } = await supabase
                .from('transactions')
                .select('*')
                .eq('type', 'income')
                .eq('status', 'paid')
                .gte('paid_at', startOfMonth);
            
            if (incomeError) throw incomeError;
                
            // 2. Expenses
             const { data: expenseTxets, error: expenseError } = await supabase
                .from('transactions')
                .select('*')
                .eq('type', 'expense')
                .eq('status', 'paid')
                .gte('paid_at', startOfMonth);
                
            if (expenseError) throw expenseError;
            
            const monthlyRevenue = incomeTxets?.reduce((acc, t) => acc + t.amount, 0) || 0;
            const monthlyExpenses = expenseTxets?.reduce((acc, t) => acc + t.amount, 0) || 0;

            // 3. Leads
            const { count: newLeads, error: leadsError } = await supabase
                .from('deals')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startOfMonth);
                
            if (leadsError) throw leadsError;

            // 4. Active Projects
            const { count: activeProjects, error: tasksError } = await supabase
                .from('tasks')
                .select('*', { count: 'exact', head: true })
                .in('status', ['in_progress', 'review']);
                
            if (tasksError) throw tasksError;

            // 5. Chart Data
            const mockChartData = [
                { name: 'Ago', income: 4000, expense: 2400 },
                { name: 'Set', income: 3000, expense: 1398 },
                { name: 'Out', income: 2000, expense: 5800 },
                { name: 'Nov', income: 2780, expense: 3908 },
                { name: 'Dez', income: 1890, expense: 4800 },
                { name: 'Jan', income: monthlyRevenue > 0 ? monthlyRevenue : 4200, expense: monthlyExpenses > 0 ? monthlyExpenses : 1200 },
            ];

            setMetrics({
                monthlyRevenue,
                monthlyExpenses,
                netProfit: monthlyRevenue - monthlyExpenses,
                newLeads: newLeads || 0,
                activeProjects: activeProjects || 0,
                conversionRate: 15,
                chartData: mockChartData
            });
        } catch (error) {
            console.error("Critical error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }

    fetchData();
  }, []);

  const formatCurrency = (val: number) => formatCurrencyUtil(val, currency, language);

  return (
    <div className="relative min-h-screen bg-transparent">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative p-8 space-y-8 pb-24 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-5xl">
              {t('dashboard.title')}
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base font-medium">{t('dashboard.welcome')}</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2.5 text-zinc-300 text-sm font-medium shadow-xl">
              <Calendar size={18} className="text-pink-500" />
              <span>{dateRange}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 min-h-[500px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
                <p className="text-zinc-500 font-medium animate-pulse">{t('dashboard.syncing')}</p>
              </div>
          </div>
        ) : (
          <>

              {/* Revenue Goal */}
              <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-1">
                <RevenueGoal current={metrics.monthlyRevenue} target={10000} />
              </div>

              {/* Bento Grid Layout - Balanced 3x3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto md:auto-rows-[160px]">
                  
                  <SpotlightCard className="md:col-span-2 md:row-span-2 flex flex-col justify-between p-6 sm:p-8 group" spotlightColor="rgba(16, 185, 129, 0.15)" hoverBorderColor="rgba(16, 185, 129, 0.5)">
                      <div className="flex justify-between items-start">
                          <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                  <div className="p-2 bg-primary-500/10 rounded-lg text-primary-500">
                                      <TrendingDown className="rotate-180" size={18} />
                                  </div>
                                  <h3 className="text-zinc-400 text-sm sm:text-base font-medium">{t('dashboard.monthly_revenue')}</h3>
                              </div>
                              <div className="space-y-1">
                                  <p className="text-4xl sm:text-6xl font-black text-white tracking-tighter">
                                      {formatCurrency(metrics.monthlyRevenue)}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs sm:text-sm text-green-500 font-bold">
                                      <ArrowUpRight size={16} />
                                      <span>+12.5% em relação a Dezembro</span>
                                  </div>
                              </div>
                          </div>
                          <div className="p-3 sm:p-4 bg-zinc-900/50 rounded-2xl border border-white/5 text-primary-500 shadow-2xl group-hover:scale-110 transition-transform hidden sm:block">
                              <DollarSign size={32} />
                          </div>
                      </div>
                      
                      {/* Visual Graphic Representation */}
                      <div className="flex items-end gap-1 h-24 w-full mt-4 overflow-hidden">
                          {[40, 60, 45, 70, 55, 80, 65, 90, 75, 100, 85].map((h, i) => (
                              <div 
                                  key={i} 
                                  className="flex-1 bg-primary-500/20 rounded-t-sm group-hover:bg-primary-500/40 transition-all duration-500 border-t border-primary-500/30"
                                  style={{ height: `${h}%`, transitionDelay: `${i * 30}ms` }}
                              />
                          ))}
                      </div>
                  </SpotlightCard>

                  {/* Card Secundário 1 - Despesas */}
                  <SpotlightCard className="p-6 flex flex-col justify-between" spotlightColor="rgba(244, 63, 94, 0.15)" hoverBorderColor="rgba(244, 63, 94, 0.5)">
                      <div className="flex justify-between items-center text-red-500">
                          <div className="p-2 bg-red-500/10 rounded-lg"><TrendingDown size={20} /></div>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Atenção</span>
                      </div>
                      <div>
                          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{t('dashboard.expenses')}</p>
                          <p className="text-2xl font-bold text-white">{formatCurrency(metrics.monthlyExpenses)}</p>
                      </div>
                  </SpotlightCard>

                  {/* Card Secundário 2 - Leads */}
                  <SpotlightCard className="p-6 flex flex-col justify-between" spotlightColor="rgba(168, 85, 247, 0.15)" hoverBorderColor="rgba(168, 85, 247, 0.5)">
                      <div className="flex justify-between items-center text-purple-500">
                          <div className="p-2 bg-purple-500/10 rounded-lg"><Users size={20} /></div>
                          <span className="text-xs text-green-400 font-bold">+4</span>
                      </div>
                      <div>
                          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{t('dashboard.new_leads')}</p>
                          <p className="text-2xl font-bold text-white">{metrics.newLeads}</p>
                      </div>
                  </SpotlightCard>

                  {/* Slot 3-1: Lucro Líquido */}
                  <SpotlightCard className="p-6 flex flex-col justify-between" spotlightColor="rgba(16, 185, 129, 0.15)" hoverBorderColor="rgba(16, 185, 129, 0.5)">
                       <div className="flex justify-between items-center text-emerald-500">
                          <div className="p-2 bg-emerald-500/10 rounded-lg"><Target size={20} /></div>
                      </div>
                      <div>
                          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{t('dashboard.net_profit')}</p>
                          <p className="text-2xl font-bold text-white">{formatCurrency(metrics.netProfit)}</p>
                      </div>
                  </SpotlightCard>

                  {/* Slot 3-2: Conversão */}
                  <SpotlightCard className="p-6 flex flex-col justify-between" spotlightColor="rgba(59, 130, 246, 0.15)" hoverBorderColor="rgba(59, 130, 246, 0.5)">
                      <div className="flex justify-between items-center text-blue-500">
                          <div className="p-2 bg-blue-500/10 rounded-lg"><ArrowUpRight size={20} /></div>
                      </div>
                      <div>
                          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{t('dashboard.conversion')}</p>
                          <p className="text-2xl font-bold text-white">{metrics.conversionRate}%</p>
                      </div>
                  </SpotlightCard>

                  {/* Slot 3-3: Projetos Ativos */}
                  <SpotlightCard className="p-6 flex flex-col justify-between" spotlightColor="rgba(249, 115, 22, 0.15)" hoverBorderColor="rgba(249, 115, 22, 0.5)">
                      <div className="flex justify-between items-center text-orange-500">
                          <div className="p-2 bg-orange-500/10 rounded-lg"><Briefcase size={20} /></div>
                          <Badge variant="outline" className="border-orange-500/20 text-orange-500 text-[10px]">Ativo</Badge>
                      </div>
                      <div>
                          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{t('dashboard.active_projects')}</p>
                          <p className="text-2xl font-bold text-white">{metrics.activeProjects} {t('dashboard.projects')}</p>
                      </div>
                  </SpotlightCard>
              </div>

              {/* Charts Section */}
              <div className="bg-zinc-900/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-8 relative group hover:border-white/20 transition-all duration-500 shadow-2xl">
                  {/* Subtle Glow behind chart */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-500/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-pink-500/10 transition-all duration-500" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                      <div>
                          <h3 className="text-xl font-bold text-white tracking-tight">{t('dashboard.analysis')}</h3>
                          <p className="text-sm text-zinc-400 mt-1">{t('dashboard.analysis_desc')}</p>
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-primary-400">
                        <ArrowUpRight size={20} />
                      </div>
                  </div>
                  <div className="h-[350px] w-full">
                       <CashFlowChart data={metrics.chartData} />
                  </div>
              </div>

              {/* Bottom Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {/* Recent Projects */}
                   <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 min-h-[350px] flex flex-col group hover:border-white/10 transition-all duration-500">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-bold text-white tracking-tight">{t('dashboard.recent_projects')}</h3>
                          <div className="p-1.5 bg-white/5 rounded-md border border-white/5">
                            <Clock size={16} className="text-zinc-500" />
                          </div>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 py-12">
                          <div className="relative mb-6">
                            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
                            <Briefcase size={56} className="relative opacity-20 text-blue-500 group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <p className="text-white font-semibold">{t('dashboard.no_projects')}</p>
                          <p className="text-sm mt-2 text-zinc-500 text-center max-w-[250px]">
                            Seus projetos ativos aparecerão aqui assim que você criar as primeiras tarefas.
                          </p>
                      </div>
                   </div>

                   {/* Recent Activity */}
                   <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 min-h-[350px] flex flex-col group hover:border-white/10 transition-all duration-500">
                      <div className="flex justify-between items-center mb-6">
                           <h3 className="text-lg font-bold text-white tracking-tight">{t('dashboard.recent_activity')}</h3>
                           <div className="p-1.5 bg-white/5 rounded-md border border-white/5">
                            <Target size={16} className="text-zinc-500" />
                          </div>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 py-12">
                          <div className="relative mb-6">
                            <div className="absolute inset-0 bg-pink-500/20 blur-2xl rounded-full" />
                            <Clock size={56} className="relative opacity-20 text-pink-500 group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <p className="text-white font-semibold">{t('dashboard.everything_up_to_date')}</p>
                          <p className="text-sm mt-2 text-zinc-500 text-center max-w-[250px]">
                            Fique por dentro das últimas atualizações e interações da sua plataforma.
                          </p>
                      </div>
                   </div>
              </div>
          </>
        )}
      </div>
    </div>
  );
}


