"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { Image as ImageIcon, ExternalLink } from "lucide-react";
import Image from "next/image";

export interface PerformanceData {
  id: string;
  name: string;
  thumbnail?: string;
  spend: number;
  cpm: number;
  cpc: number;
  ctr: number;
  conversions: number;
  cpa: number;
  roas: number;
  status: 'active' | 'paused' | 'archived';
}

interface PerformanceTableProps {
  data: PerformanceData[];
  type: 'campaign' | 'adset' | 'ad' | 'creative';
}

export function PerformanceTable({ data, type }: PerformanceTableProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-zinc-900/50 overflow-hidden">
      <Table>
        <TableHeader className="bg-white/2">
          <TableRow className="border-white/5 hover:bg-transparent">
            {type === 'creative' && <TableHead className="w-[80px] text-[10px] font-bold uppercase text-zinc-500">Preview</TableHead>}
            <TableHead className="text-[10px] font-bold uppercase text-zinc-500">Nome</TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase text-zinc-500">Gasto</TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase text-zinc-500">CPC</TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase text-zinc-500">CTR</TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase text-zinc-500">Conv.</TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase text-zinc-500">ROAS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow 
              key={item.id} 
              className={cn(
                "border-white/5 transition-colors",
                index % 2 === 0 ? "bg-transparent" : "bg-white/2 hover:bg-white/4"
              )}
            >
              {type === 'creative' && (
                <TableCell className="py-3">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden cursor-zoom-in group">
                        {item.thumbnail ? (
                          <Image src={item.thumbnail} alt={item.name} width={40} height={40} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                        ) : (
                          <ImageIcon size={16} className="text-zinc-600" />
                        )}
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 bg-zinc-950 border-white/10 p-0 overflow-hidden shadow-2xl">
                      {item.thumbnail ? (
                        <Image src={item.thumbnail} alt={item.name} width={320} height={320} className="w-full h-auto" />
                      ) : (
                        <div className="aspect-square flex flex-col items-center justify-center text-zinc-500 bg-zinc-900">
                           <ImageIcon size={48} className="mb-2 opacity-20" />
                           <p className="text-xs">Sem prévia disponível</p>
                        </div>
                      )}
                      <div className="p-3 bg-zinc-900/50 backdrop-blur-sm border-t border-white/5">
                        <p className="text-xs font-bold text-white truncate">{item.name}</p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </TableCell>
              )}
              <TableCell className="py-3">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                    {item.name}
                    <ExternalLink size={10} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <span className={cn(
                    "text-[9px] uppercase font-bold tracking-widest mt-0.5",
                    item.status === 'active' ? "text-emerald-500" : "text-zinc-600"
                  )}>
                    {item.status === 'active' ? '● Veiculando' : '○ Pausado'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-zinc-100">
                R$ {item.spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-zinc-100">
                R$ {item.cpc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-zinc-100">
                {item.ctr}%
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-white font-bold">
                {item.conversions}
              </TableCell>
              <TableCell className="text-right">
                <span className={cn(
                  "font-mono text-xs font-bold px-2 py-1 rounded-md",
                  item.roas >= 2 
                    ? "bg-emerald-500/10 text-emerald-500" 
                    : item.roas < 1 
                      ? "bg-red-500/10 text-red-500" 
                      : "bg-zinc-800 text-zinc-400"
                )}>
                  {item.roas.toFixed(2)}x
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
