import clsx from "clsx";
import { LucideIcon } from "lucide-react";

interface FinanceCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  variant?: 'default' | 'expense' | 'info';
}

export function FinanceCard({ title, value, subtitle, icon: Icon, variant = 'default' }: FinanceCardProps) {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={clsx(
          "p-2 rounded-lg",
          variant === 'default' && "bg-primary-500/10 text-primary-500",
          variant === 'expense' && "bg-red-500/10 text-red-500",
          variant === 'info' && "bg-blue-500/10 text-blue-500",
        )}>
          <Icon size={24} />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-sm font-medium text-white/80">{title}</p>
        <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
