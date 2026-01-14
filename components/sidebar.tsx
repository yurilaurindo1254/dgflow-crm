"use client";

import Link from "next/link";
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
  Plus,
  Smartphone,
  LogOut,
  ChevronsUpDown,
  Briefcase,
} from "lucide-react";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationCenter } from "@/components/notifications/notification-center";

const menuItems = [
  { name: "Visão Geral", icon: LayoutDashboard, href: "/" },
  { name: "Projetos", icon: Briefcase, href: "/projetos" },
  { name: "Clientes", icon: Users, href: "/clientes" },
  { name: "Pipelines", icon: Filter, href: "/pipelines" },
  { name: "Agenda", icon: Calendar, href: "/agenda" },
  { name: "Financeiro", icon: DollarSign, href: "/financeiro" },
  { name: "Serviços", icon: Package, href: "/servicos" },
  { name: "Orçamentos", icon: FileText, href: "/orcamentos" },
  { name: "Briefings", icon: FileInput, href: "/briefings" },
  { name: "Link na Bio", icon: Smartphone, href: "/link-bio" },
  { name: "Equipe", icon: Users, href: "/equipe" },
  { name: "Configurações", icon: Settings, href: "/configuracoes" },
];

import { useModal } from '@/contexts/modal-context';
import { NewProposalModal } from '@/components/modals/new-proposal-modal';

// ... (imports anteriores mantidos se não conflitarem, mas vou reescrever o componente para garantir a inserção correta)
// Como o replace_file_content substitui o bloco, vou focar na parte do componente Sidebar.

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { openModal } = useModal();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-20 hover:w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col z-50 transition-all duration-300 ease-in-out group overflow-hidden">
      {/* Header / Logo */}
      <div className="p-0 h-[88px] flex items-center justify-center">
        <h1 className="text-2xl font-bold bg-linear-to-r
 from-primary-500 to-emerald-400 bg-clip-text text-transparent filter drop-shadow-[0_0_10px_rgba(121,205,37,0.3)] whitespace-nowrap overflow-hidden transition-all duration-300 flex items-center">
          <span className="w-20 flex justify-center shrink-0">D</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-[-20px] group-hover:ml-0">GFlow</span>
        </h1>
      </div>

      {/* Primary CTA */}
      <div className="px-3 mb-6">
        <button 
          onClick={() => openModal(<NewProposalModal />)}
          className="w-full flex items-center justify-start gap-3 bg-primary-500 hover:bg-primary-600 hover:shadow-[0_0_20px_rgba(121,205,37,0.4)] transition-all duration-300 text-black font-bold h-12 rounded-xl shadow-lg cursor-pointer group/btn overflow-hidden px-4"
        >
          <div className="shrink-0">
            <Plus size={24} className="group-hover/btn:rotate-90 transition-transform duration-300" />
          </div>
          <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Nova Proposta</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar overflow-x-hidden">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.name}
              className={clsx(
                "flex items-center gap-4 px-[18px] py-3 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden group/item",
                isActive
                  ? "text-white bg-white/5 shadow-[inset_0_0_20px_rgba(121,205,37,0.1)] border border-white/5"
                  : "text-zinc-400 hover:text-white hover:bg-white/5 hover:border hover:border-white/5"
              )}
            >
              {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 shadow-[0_0_10px_var(--color-primary-500)]"></div>}
              <div className="shrink-0">
                  <item.icon
                    size={20}
                    className={clsx(isActive ? "text-primary-500 drop-shadow-[0_0_5px_rgba(121,205,37,0.5)]" : "text-zinc-500 group-hover/item:text-zinc-300 transition-colors")}
                  />
              </div>
              <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Notifications & User Profile */}
      <div className="p-3 border-t border-white/5 bg-black/20 space-y-2">
        <div className="flex items-center justify-center group-hover:justify-start transition-all duration-300">
          <NotificationCenter />
          <span className="ml-3 text-sm text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Notificações
          </span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors w-full outline-none group/user data-[state=open]:bg-white/5 border border-transparent hover:border-white/5 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-linear-to-br
 from-primary-500 to-emerald-600 flex items-center justify-center text-black font-bold shrink-0 shadow-[0_0_10px_rgba(121,205,37,0.2)]">
                U
              </div>
              <div className="flex-1 overflow-hidden text-left opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm font-medium text-white truncate group-hover/user:text-primary-500 transition-colors">
                  Usuário Demo
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Plano PRO</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_5px_var(--color-primary-500)]"></span>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ChevronsUpDown className="size-4 text-zinc-500 group-hover/user:text-white transition-colors" />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-black/80 backdrop-blur-xl border-white/10 text-white p-2 shadow-2xl"
            side="right"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="font-normal px-2 py-1.5">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">Usuário Demo</p>
                <p className="text-xs leading-none text-zinc-400">
                  usuario@demo.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10 my-1" />
            <DropdownMenuItem 
                className="focus:bg-white/10 focus:text-white cursor-pointer px-2 py-2 rounded-md"
                onClick={() => router.push("/configuracoes")}
            >
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10 my-1" />
            <DropdownMenuItem 
                className="text-red-500 focus:text-red-400 focus:bg-red-500/10 cursor-pointer px-2 py-2 rounded-md"
                onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
