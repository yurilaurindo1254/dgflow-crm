"use client";

import { MoreHorizontal, Edit, Trash2, Package, Clock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_recurring: boolean;
  recurring_period: string;
}

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Cores por categoria (Visual Flair)
  const getCategoryColor = (cat: string) => {
      const colors: Record<string, string> = {
          'Design': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
          'Tráfego Pago': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          'Development': 'bg-green-500/10 text-green-500 border-green-500/20',
          'Consultoria': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      };
      return colors[cat] || 'bg-zinc-800 text-zinc-400 border-zinc-700';
  };

  return (
    <Card className="group relative overflow-hidden bg-zinc-900/40 border-white/5 hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5">
      
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-linear-to-br from-primary-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <CardHeader className="p-5 pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-wider border", getCategoryColor(service.category))}>
             {service.category || 'Geral'}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-zinc-500 hover:text-white">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10">
              <DropdownMenuItem onClick={() => onEdit(service)} className="cursor-pointer text-white hover:bg-white/5">
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={() => onDelete(service.id)} className="text-red-500 focus:text-red-500 cursor-pointer hover:bg-red-500/10">
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <h3 className="font-bold text-lg text-white mt-2 leading-tight group-hover:text-primary-500 transition-colors">
            {service.name}
        </h3>
      </CardHeader>

      <CardContent className="p-5 py-2 min-h-[80px]">
        <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">
            {service.description}
        </p>
      </CardContent>

      <CardFooter className="p-5 pt-2 flex items-end justify-between border-t border-white/5 mt-auto">
         <div>
             <p className="text-xs text-zinc-500 font-medium uppercase mb-0.5">Valor</p>
             <div className="flex items-baseline gap-1">
                 <span className="text-xl font-bold text-white tracking-tight">
                    {formatCurrency(service.price)}
                 </span>
                 {service.is_recurring && (
                     <span className="text-xs text-zinc-500 font-medium">
                         /{service.recurring_period?.toLowerCase().replace('mente', '') || 'mês'}
                     </span>
                 )}
             </div>
         </div>
         {service.is_recurring && (
             <div className="flex items-center gap-1.5 text-xs text-primary-500 bg-primary-500/10 px-2 py-1 rounded-md border border-primary-500/20">
                 <Clock size={12} />
                 <span>Recorrente</span>
             </div>
         )}
      </CardFooter>
    </Card>
  );
}
