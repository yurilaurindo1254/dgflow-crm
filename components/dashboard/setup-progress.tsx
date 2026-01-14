"use client";

import { useState } from "react";
import { User, Rocket, Globe, Smartphone, ChevronDown, CheckCircle2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export function SetupProgress() {
    const [isOpen, setIsOpen] = useState(true);

    const steps = [
        { id: 1, label: "Complete seu perfil", desc: "Adicione sua foto e configure suas informações", points: 20, completed: true, icon: User },
        { id: 2, label: "Adicione seu primeiro lead", desc: "Cadastre um cliente potencial", points: 25, completed: false, icon: User },
        { id: 3, label: "Configure sua página pública", desc: "Personalize seu portfólio profissional", points: 30, completed: false, icon: Globe },
        { id: 4, label: "Configure seu link na bio", desc: "Adicione links ao seu perfil", points: 25, completed: false, icon: Globe },
        { id: 5, label: "Instale o app no celular", desc: "Acesse de forma mais rápida", points: 15, completed: false, icon: Smartphone },
    ];

    const totalPoints = steps.reduce((acc, step) => acc + step.points, 0);
    const earnedPoints = steps.filter(s => s.completed).reduce((acc, step) => acc + step.points, 0);
    const completedCount = steps.filter(s => s.completed).length;
    const progress = (completedCount / steps.length) * 100;

    return (
        <div className="bg-transparent border-0 overflow-hidden">
            <div 
                className="p-4 flex items-center justify-between cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                        <Rocket size={20} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold flex items-center gap-2">
                            Complete seu setup
                            <span className="text-xs font-normal text-zinc-400 hidden sm:inline-block">Ganhe pontos configurando sua conta</span>
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                             <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                 <div className="h-full bg-linear-to-r from-primary-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                             </div>
                             <span className="text-xs text-zinc-400">{completedCount} de {steps.length} tarefas</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="bg-primary-500/20 border border-primary-500/30 px-3 py-1 rounded-full text-primary-500 text-xs font-bold flex items-center gap-1">
                        ★ {earnedPoints}/{totalPoints}
                    </div>
                    <ChevronDown size={20} className={clsx("text-zinc-500 transition-transform", isOpen && "rotate-180")} />
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5"
                    >
                        {steps.map((step) => (
                            <div key={step.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", step.completed ? "bg-green-500/10 text-green-500" : "bg-zinc-800 text-zinc-500")}>
                                        <step.icon size={16} />
                                    </div>
                                    <div>
                                        <h4 className={clsx("text-sm font-medium transition-colors", step.completed ? "text-zinc-500 line-through" : "text-white group-hover:text-primary-500")}>{step.label}</h4>
                                        <p className="text-xs text-zinc-500">{step.desc}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    {!step.completed && (
                                        <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-white/5">+{step.points} pts</span>
                                    )}
                                    {step.completed ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} className="text-zinc-600 group-hover:text-primary-500 transition-colors" />}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
