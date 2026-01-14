"use client";

import { useNotifications } from "@/hooks/use-notifications";
import { Bell, Check, Circle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors group/bell outline-none">
          <Bell
            size={20}
            className={cn(
              "transition-colors",
              unreadCount > 0 ? "text-primary-500" : "text-zinc-500 group-hover/bell:text-zinc-300"
            )}
          />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center p-0 text-[10px] bg-primary-500 text-black border-none font-bold"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-0 bg-zinc-950/90 backdrop-blur-xl border-white/10 shadow-2xl" 
        align="start" 
        side="right"
        sideOffset={15}
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
          <h3 className="text-sm font-semibold text-white">Notificações</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-[10px] h-7 px-2 hover:bg-white/5 text-primary-500 hover:text-primary-400"
            >
              Marcar tudo como lido
            </Button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-3">
                <Bell size={20} className="text-zinc-600" />
              </div>
              <p className="text-xs text-zinc-500">Nenhuma notificação por aqui.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={cn(
                    "p-4 transition-colors group/item relative",
                    !n.read ? "bg-primary-500/5" : "hover:bg-white/[0.02]"
                  )}
                >
                  <div className="flex gap-3">
                    <div className={cn(
                        "w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs border transition-colors",
                        !n.read ? "bg-primary-500/20 border-primary-500/30 text-primary-500" : "bg-zinc-900 border-white/5 text-zinc-500"
                    )}>
                        {n.type === 'task_assignment' ? <Check size={14} /> : <Circle size={10} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                          "text-xs font-medium truncate",
                          !n.read ? "text-white" : "text-zinc-400"
                      )}>
                        {n.title}
                      </p>
                      <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-2 flex items-center gap-1.5 uppercase font-bold tracking-wider">
                        {format(new Date(n.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    {!n.read && (
                      <button 
                        onClick={() => markAsRead(n.id)}
                        className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 rounded-md h-fit"
                        title="Marcar como lida"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-white/5 text-center bg-zinc-900/30">
          <Button variant="ghost" size="sm" className="w-full text-[10px] text-zinc-500 hover:text-white h-7">
            Ver todas as atividades
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
