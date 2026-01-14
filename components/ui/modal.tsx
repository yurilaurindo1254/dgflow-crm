"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode } from "react";
import { useModal } from "@/contexts/modal-context";
import { cn } from "@/lib/utils";

interface ModalProps {
  children: ReactNode;
  title?: string;
  className?: string; // Add className prop
}

export function Modal({ children, title, className }: ModalProps) {
  const { closeModal } = useModal();

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={cn("bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl", className)}

        >
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <button
              onClick={closeModal}
              className="text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
