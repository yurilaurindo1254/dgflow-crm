"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Filter,
  Calendar,
  DollarSign,
  Package,
  FileText,
  FileInput,
  Settings,
  Menu,
  Smartphone,
  Briefcase
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSettings } from "@/contexts/settings-context";

const DEFAULT_TABS = ["overview", "pipelines", "calendar", "financial"];

// Mapping of all available routes/icons
export function MobileBottomBar() {
  const pathname = usePathname();
  const { t } = useSettings();
  const [activeTabs, setActiveTabs] = useState<string[]>(DEFAULT_TABS);
  const [isClient, setIsClient] = useState(false);

  // Mapping of all available routes/icons
  const AVAILABLE_ITEMS = [
    { id: "overview", name: t('sidebar.dashboard'), icon: LayoutDashboard, href: "/" },
    { id: "projects", name: t('sidebar.projects'), icon: Briefcase, href: "/projetos" },
    { id: "clients", name: t('sidebar.clients'), icon: Users, href: "/clientes" },
    { id: "pipelines", name: t('sidebar.pipelines'), icon: Filter, href: "/pipelines" },
    { id: "calendar", name: t('sidebar.agenda'), icon: Calendar, href: "/agenda" },
    { id: "financial", name: t('sidebar.finance'), icon: DollarSign, href: "/financeiro" },
    { id: "services", name: t('sidebar.services'), icon: Package, href: "/servicos" },
    { id: "quotes", name: t('sidebar.quotes'), icon: FileText, href: "/orcamentos" },
    { id: "briefings", name: t('sidebar.briefings'), icon: FileInput, href: "/briefings" },
    { id: "biolink", name: t('sidebar.link_bio'), icon: Smartphone, href: "/link-bio" },
    { id: "team", name: t('sidebar.team'), icon: Users, href: "/equipe" },
    { id: "settings", name: t('sidebar.settings'), icon: Settings, href: "/configuracoes" },
  ];

  useEffect(() => {
    // Standard hack to avoid "setState during render" warning in some strict linters,
    // and ensuring hydration matches.
    const timer = setTimeout(() => {
        setIsClient(true);
        const saved = localStorage.getItem("mobile-tabs");
        if (saved) {
            try {
                setActiveTabs(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse saved tabs", e);
            }
        }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const saveTabs = (newTabs: string[]) => {
    setActiveTabs(newTabs);
    localStorage.setItem("mobile-tabs", JSON.stringify(newTabs));
  };

  const toggleTab = (id: string) => {
    if (activeTabs.includes(id)) {
      if (activeTabs.length > 1) { // Prevent empty bar
        saveTabs(activeTabs.filter((t) => t !== id));
      }
    } else {
      if (activeTabs.length < 4) { // Limit to 4 tabs + Menu
        saveTabs([...activeTabs, id]);
      }
    }
  };

  if (!isClient) return null;

  return (
    <div className="md:hidden fixed bottom-5 left-4 right-4 h-16 bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-between px-2 z-50 shadow-2xl safe-area-bottom">
      
      {/* Active Tabs */}
      {activeTabs.map((tabId) => {
        const item = AVAILABLE_ITEMS.find((i) => i.id === tabId);
        if (!item) return null;
        
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 relative",
              isActive ? "text-primary-500 scale-110" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
             <div className={cn(
                "p-1.5 rounded-full transition-all",
                isActive && "bg-primary-500/10"
             )}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
             </div>
             {isActive && <span className="text-[10px] font-bold">{item.name}</span>}
             {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 bg-primary-500 rounded-full shadow-[0_0_8px_#79CD25]" />
             )}
          </Link>
        );
      })}

      {/* Menu / Customizer Button */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="flex flex-col items-center justify-center w-full h-full gap-1 text-zinc-500 hover:text-white transition-colors">
             <div className="bg-white/5 p-2 rounded-full border border-white/5">
                <Menu size={20} />
             </div>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="bg-zinc-950 border-t border-white/10 rounded-t-3xl pb-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
           <SheetHeader className="mb-6">
             <SheetTitle className="text-white text-center">Menu DGFlow</SheetTitle>
           </SheetHeader>
           
           <div className="space-y-8">
               {/* Quick Navigation Section */}
               <section>
                   <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 px-1">Navegação Direta</h4>
                   <div className="grid grid-cols-3 gap-2">
                       {AVAILABLE_ITEMS.map((item) => {
                           const isActive = pathname === item.href;
                           return (
                               <Link
                                   key={item.id}
                                   href={item.href}
                                   className={cn(
                                       "flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2",
                                       isActive 
                                           ? "bg-primary-500/10 border-primary-500/30 text-primary-500" 
                                           : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10"
                                   )}
                               >
                                   <item.icon size={18} />
                                   <span className="text-[10px] font-medium truncate w-full text-center">{item.name}</span>
                               </Link>
                           )
                       })}
                   </div>
               </section>

               {/* Customization Section */}
               <section>
                   <div className="flex flex-col items-center mb-4">
                       <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Personalizar Barra</h4>
                       <p className="text-zinc-600 text-[10px] mt-1">
                            Selecione até 4 atalhos fixos.
                       </p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3 px-1">
                      {AVAILABLE_ITEMS.map((item) => {
                          const isSelected = activeTabs.includes(item.id);
                          const isDisabled = !isSelected && activeTabs.length >= 4;
        
                          return (
                              <div 
                                key={item.id}
                                onClick={() => !isDisabled && toggleTab(item.id)}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                    isSelected 
                                        ? "bg-primary-500/20 border-primary-500/50" 
                                        : "bg-white/5 border-white/5 hover:bg-white/10",
                                    isDisabled && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                  <div className={cn(
                                      "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                                      isSelected ? "bg-primary-500 border-primary-500" : "border-zinc-600"
                                  )}>
                                      {isSelected && <item.icon size={10} className="text-black" />}
                                  </div>
                                  <span className={cn("text-xs font-medium", isSelected ? "text-primary-500" : "text-zinc-400")}>
                                      {item.name}
                                  </span>
                              </div>
                          )
                      })}
                   </div>
               </section>
           </div>
        </SheetContent>
      </Sheet>

    </div>
  );
}
