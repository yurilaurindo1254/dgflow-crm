"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, MoreHorizontal, Building2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  client_name: string;
  company_name?: string;
  created_at: string;
  priority?: 'low' | 'medium' | 'high';
  probability?: number;
  assignee?: { name: string; avatar?: string };
  user_id?: string;
}

interface DealCardProps {
  deal: Deal;
}

export function DealCard({ deal }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: deal.id,
    data: { type: "Deal", deal },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.value);
  
  // Cores para os Badges usando classes do Tailwind direto para customização fina ou variants do shadcn
  const priorityVariant = deal.priority === 'high' ? 'destructive' : deal.priority === 'medium' ? 'secondary' : 'outline';

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 h-[160px] rounded-xl border-2 border-primary bg-background/50"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="group relative">
      <Card className="hover:border-primary/50 transition-all cursor-grab active:cursor-grabbing hover:shadow-md bg-card/60 backdrop-blur-sm">
        <CardHeader className="p-3 pb-0 space-y-0">
          <div className="flex justify-between items-start">
            <Badge variant={priorityVariant} className="text-[10px] px-1.5 py-0 h-5 uppercase">
              {deal.priority || 'Normal'}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Editar</DropdownMenuItem>
                <DropdownMenuItem>Mover</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Perdido</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <h4 className="font-semibold text-sm mt-2 line-clamp-2 leading-tight">
            {deal.title}
          </h4>
        </CardHeader>
        
        <CardContent className="p-3 py-2">
          <div className="text-lg font-bold tracking-tight text-foreground">
             {formattedValue}
          </div>
          
          <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground">
             <div className="flex items-center gap-2">
                 <User size={12} />
                 <span className="truncate">{deal.client_name}</span>
             </div>
             {deal.company_name && (
                 <div className="flex items-center gap-2">
                     <Building2 size={12} />
                     <span className="truncate">{deal.company_name}</span>
                 </div>
             )}
          </div>
        </CardContent>

        <CardFooter className="p-3 pt-0 flex flex-col gap-2">
           {/* Probabilidade */}
           <div className="w-full flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="w-8">{deal.probability || 50}%</span>
              <Progress value={deal.probability || 50} className="h-1.5" />
           </div>

           <div className="flex justify-between items-center w-full pt-2 border-t border-border/50">
               <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                 <Calendar size={12} />
                 <span>{new Date(deal.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
               </div>
               
               {deal.assignee && (
                   <Avatar className="h-5 w-5">
                       <AvatarImage src={deal.assignee.avatar} />
                       <AvatarFallback className="text-[8px]">{deal.assignee.name.substring(0,2)}</AvatarFallback>
                   </Avatar>
               )}
           </div>
        </CardFooter>
      </Card>
    </div>
  );
}
