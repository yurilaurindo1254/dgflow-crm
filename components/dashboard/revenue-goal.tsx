"use client";

import { useSettings } from "@/contexts/settings-context";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils/format";
import { Target } from "lucide-react";

export function RevenueGoal({ current, target }: { current: number, target: number }) {
    const { t, language, currency } = useSettings();
    const progress = Math.min((current / target) * 100, 100);
    const formatCurrency = (val: number) => formatCurrencyUtil(val, currency, language);

    return (
        <div className="bg-transparent border-0 p-6 relative overflow-hidden">
             {/* Background glow */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

             <div className="flex items-center justify-between mb-4 relative z-10">
                 <div className="flex items-center gap-2">
                     <Target size={18} className="text-primary-500" />
                     <h3 className="text-sm font-bold text-white uppercase tracking-wide">{t('dashboard.revenue_goal')}</h3>
                 </div>
                 <span className="text-xs text-zinc-400 font-medium tracking-wide">{t('dashboard.current_month_progress')}</span>
             </div>

             <div className="relative z-10">
                 <div className="flex justify-between items-baseline mb-2 text-sm">
                     <span className="text-white font-bold text-lg">{formatCurrency(current)}</span>
                     <span className="text-primary-500 font-bold">{formatCurrency(target)}</span>
                 </div>
                 
                 <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden border border-white/5 relative">
                     {/* Striped pattern overlay could go here */}
                     <div 
                        className="h-full bg-linear-to-r from-primary-500 via-emerald-500 to-teal-500 rounded-full relative transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                     >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                     </div>
                 </div>
                 
                 <div className="flex justify-between mt-2 text-xs text-zinc-500">
                     <span>{progress.toFixed(0)}% {t('dashboard.reached')}</span>
                     <span>{t('dashboard.remaining')} {formatCurrency(target - current)}</span>
                 </div>
             </div>
        </div>
    );
}
