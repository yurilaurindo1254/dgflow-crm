"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spotlightColor?: string;
  hoverBorderColor?: string;
}

export function SpotlightCard({ 
  children, 
  className, 
  spotlightColor = "rgba(121, 205, 37, 0.2)", 
  hoverBorderColor,
  ...props 
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setOpacity(1);
  };

  const handleBlur = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleFocus}
      onMouseLeave={handleBlur}
      style={{
        "--spotlight-color": spotlightColor,
        "--hover-border-color": hoverBorderColor || spotlightColor,
      } as React.CSSProperties}
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-(--hover-border-color)",
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
