"use client";

import { cn } from "@/lib/utils";

interface DarkVeilProps {
  className?: string;
}

export function DarkVeil({ className }: DarkVeilProps) {
  return (
    <div className={cn("fixed inset-0 -z-10 h-full w-full bg-[#050a05] overflow-hidden", className)}>
      {/* Mudei o fundo base de #09090b (zinco) para #050a05 (verde quase preto)
         para dar um tint esverdeado imperceptível em toda a tela.
      */}

      {/* Camada de Ruído (Noise) - Mantém a textura */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: 'url("/noise.svg")' }} 
      />

      {/* Blob 1 - Topo Esquerdo: Verde Esmeralda Profundo (Base Sombria) */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-600/50 blur-[60px] animate-pulse" style={{ animationDuration: '4s' }} />

      {/* Blob 2 - Base Direita: Verde Neon / Lime (O Brilho "Radioativo") */}
      <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-green-500/40 blur-[60px] animate-pulse" style={{ animationDuration: '7s' }} />

      {/* O "Véu" central - Gradiente radial para focar no centro */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050a05_100%)]" />
      
      {/* Grid muito sutil em verde escuro */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#22c55e05_1px,transparent_1px),linear-gradient(to_bottom,#22c55e05_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    </div>
  );
}
