"use client";

import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuotesList } from "@/components/quotes/quotes-list";
import { ContractsList } from "@/components/quotes/contracts-list";
import { ApprovalSettings } from "@/components/quotes/approval-settings";

export default function QuotesPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "quotes";

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Gestão de Orçamentos</h1>
        <p className="text-zinc-400 mt-1">Gerencie propostas, contratos e identidade visual.</p>
      </div>

      <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col">
        <TabsList className="bg-zinc-900/50 border border-white/5 w-fit p-1 mb-6">
            <TabsTrigger value="quotes" className="px-6 data-[state=active]:bg-primary-500 data-[state=active]:text-black font-bold">
                Orçamentos
            </TabsTrigger>
            <TabsTrigger value="contracts" className="px-6 data-[state=active]:bg-primary-500 data-[state=active]:text-black font-bold">
                Contratos
            </TabsTrigger>
            <TabsTrigger value="settings" className="px-6 data-[state=active]:bg-primary-500 data-[state=active]:text-black font-bold">
                Página de Aprovação
            </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0">
            <TabsContent value="quotes" className="h-full focus-visible:outline-none data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-left-2">
                <QuotesList />
            </TabsContent>
            
            <TabsContent value="contracts" className="h-full focus-visible:outline-none data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-left-2">
                <ContractsList />
            </TabsContent>

            <TabsContent value="settings" className="h-full focus-visible:outline-none data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-left-2">
                <ApprovalSettings />
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
