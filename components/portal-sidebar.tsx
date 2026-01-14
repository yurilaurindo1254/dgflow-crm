"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  BarChart3,
  CheckCircle2,
  Clock,
  LogOut,
  User
} from "lucide-react";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const portalMenuItems = [
  { name: "Início", icon: LayoutDashboard, href: "/portal" },
  { name: "Performance", icon: BarChart3, href: "/portal/performance" },
  { name: "Projetos", icon: CheckCircle2, href: "/portal/projects" },
  { name: "Aprovações", icon: Clock, href: "/portal/approvals" },
];

export function PortalSidebar() {
  const pathname = usePathname();
  const router = useRouter();

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
    <aside className="fixed left-0 top-0 h-full w-64 bg-zinc-950 border-r border-white/5 flex flex-col z-50">
      <div className="p-8">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Portal do Cliente
        </h1>
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
          DGFlow Agency
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {portalMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "text-white bg-white/5 border border-white/10 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/2"

              )}
            >
              <item.icon
                size={18}
                className={clsx(isActive ? "text-primary-500" : "text-zinc-500 group-hover:text-zinc-400")}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}
