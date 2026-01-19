"use client";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Creative {
    id: string;
    name: string;
    thumbnail: string;
    preview: string; // URL do vídeo
    type: 'video' | 'image';
    spend: number;
    roas: number;
    hookRate: number; // 0-100
    holdRate: number; // 0-100
}

export function CreativeTable({ creatives }: { creatives: Creative[] }) {
  return (
    <div className="rounded-md border border-white/5 bg-zinc-900/50 overflow-hidden">
      <Table>
        <TableHeader className="bg-zinc-950/50">
          <TableRow className="hover:bg-transparent border-white/5">
            <TableHead className="w-[300px]">Criativo</TableHead>
            <TableHead>Retenção (Hook/Hold)</TableHead>
            <TableHead className="text-right">Gasto</TableHead>
            <TableHead className="text-right">ROAS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {creatives.map((creative) => (
            <TableRow key={creative.id} className="border-white/5 hover:bg-white/5 transition-colors group">
              {/* Coluna 1: Preview Visual Interativo */}
              <TableCell>
                 <div className="flex items-center gap-3">
                    <HoverCard>
                        <HoverCardTrigger asChild>
                            <div className="relative cursor-pointer">
                                <Avatar className="h-12 w-12 rounded-lg border border-white/10 group-hover:border-primary-500/50 transition-colors">
                                    <AvatarImage src={creative.thumbnail} className="object-cover" />
                                    <AvatarFallback>AD</AvatarFallback>
                                </Avatar>
                                {creative.type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                                        <PlayCircle size={16} className="text-white opacity-80" />
                                    </div>
                                )}
                            </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-[320px] p-0 border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden" align="start">
                            {creative.type === 'video' ? (
                                <div className="aspect-9/16 bg-black w-full relative">
                                    <video 
                                        src={creative.preview} 
                                        autoPlay 
                                        muted 
                                        loop 
                                        className="w-full h-full object-cover" 
                                    />
                                    <div className="absolute bottom-0 inset-x-0 p-3 bg-linear-to-t from-black/80 to-transparent">
                                        <p className="text-xs text-white font-medium line-clamp-2">{creative.name}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative w-full aspect-square bg-black">
                                    <Image 
                                        src={creative.thumbnail} 
                                        alt="Preview" 
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            )}
                        </HoverCardContent>
                    </HoverCard>
                    
                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-zinc-200 text-sm line-clamp-1 max-w-[180px]">{creative.name}</span>
                        <Badge variant="outline" className="w-fit text-[9px] h-4 px-1 border-white/10 text-zinc-500">
                            {creative.type.toUpperCase()}
                        </Badge>
                    </div>
                 </div>
              </TableCell>

              {/* Coluna 2: Métricas de Retenção */}
              <TableCell>
                  <div className="space-y-3 w-[180px]">
                      <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-zinc-400">
                              <span>Hook Rate (3s)</span>
                              <span className="text-white font-bold">{creative.hookRate}%</span>
                          </div>
                          <Progress value={creative.hookRate} className="h-1.5 bg-zinc-800" indicatorClassName="bg-blue-500" />
                      </div>
                      <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-zinc-400">
                              <span>Hold Rate (15s)</span>
                              <span className="text-white font-bold">{creative.holdRate}%</span>
                          </div>
                          <Progress value={creative.holdRate} className="h-1.5 bg-zinc-800" indicatorClassName="bg-purple-500" />
                      </div>
                  </div>
              </TableCell>

              {/* Financeiro */}
              <TableCell className="text-right font-mono text-zinc-300">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(creative.spend)}
              </TableCell>
              
              <TableCell className="text-right">
                  <span className={cn(
                      "font-bold font-mono px-2 py-1 rounded bg-opacity-10",
                      creative.roas >= 2 ? "bg-emerald-500 text-emerald-500" : 
                      creative.roas >= 1 ? "bg-yellow-500 text-yellow-500" : "bg-red-500 text-red-500"
                  )}>
                      {creative.roas.toFixed(2)}x
                  </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
