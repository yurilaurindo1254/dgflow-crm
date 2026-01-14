"use client";

import { useState } from "react";
import { DarkVeil } from "@/components/ui/dark-veil";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export function ThemeToggleWrapper() {
  const [isEnabled, setIsEnabled] = useState(true);

  return (
    <>
      {isEnabled && <DarkVeil />}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
            onClick={() => setIsEnabled(!isEnabled)}
            variant="outline"
            className="rounded-full h-12 px-6 bg-zinc-950/80 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30 hover:border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all uppercase tracking-widest text-xs font-bold backdrop-blur-md"
        >
            <span className="mr-2">{isEnabled ? "Matrix Mode: ON" : "Matrix Mode: OFF"}</span>
            {isEnabled ? <Eye size={16} /> : <EyeOff size={16} />}
        </Button>
      </div>
    </>
  );
}
