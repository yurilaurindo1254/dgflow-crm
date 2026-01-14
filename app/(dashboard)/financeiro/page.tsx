"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Users
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewTransactionModal } from "@/components/modals/new-transaction-modal";
import { ReceivablesView } from "@/components/finance/receivables-view";
import { PayablesView } from "@/components/finance/payables-view";
import { ClientsFinanceView } from "@/components/finance/clients-finance-view";
import { formatCurrency } from "@/lib/utils/format";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useModal } from "@/contexts/modal-context";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  created_at: string;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  client_id?: string;
}

export default function FinancePage() {
  const { openModal } = useModal();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Month navigation
  const nextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const formattedMonth = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const capitalizedMonth = formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      // Filter by current month in the query or locally
      const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).toISOString();
      const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).toISOString();

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('due_date', firstDay)
        .lte('due_date', lastDay)
        .order('due_date', { ascending: false });

      if (error) throw error;
      setTransactions((data as Transaction[]) || []);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      // Mock data for development if Supabase fails or table doesn't exist
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Calculations
  const incomes = transactions.filter(t => t.type === 'income');
  const expenses = transactions.filter(t => t.type === 'expense');

  const receivedTotal = incomes.filter(t => t.status === 'paid').reduce((acc, t) => acc + t.amount, 0);
  const pendingIncome = incomes.filter(t => t.status === 'pending').reduce((acc, t) => acc + t.amount, 0);
  const overdueIncome = incomes.filter(t => t.status === 'overdue').reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = receivedTotal + pendingIncome + overdueIncome;

  const paidTotal = expenses.filter(t => t.status === 'paid').reduce((acc, t) => acc + t.amount, 0);
  const pendingExpense = expenses.filter(t => t.status === 'pending').reduce((acc, t) => acc + t.amount, 0);
  const overdueExpense = expenses.filter(t => t.status === 'overdue').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = paidTotal + pendingExpense + overdueExpense;

  const netProfit = receivedTotal - paidTotal;

  // Local Filtering
  const filteredTransactions = transactions.filter(t => {
    // Status Filter
    if (filterStatus !== "all" && t.status !== filterStatus) return false;

    // Category Filter
    if (filterCategory !== "all" && t.category !== filterCategory) return false;

    // Date Range Filter
    if (dateRange.from && dateRange.to) {
      const dueDate = new Date(t.due_date);
      if (dueDate < dateRange.from || dueDate > dateRange.to) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header with Title and Month Selector */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Financeiro</h1>
          <p className="text-zinc-400">Controle suas receitas, despesas e contas</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center bg-zinc-900 border border-white/10 rounded-xl p-1">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="text-zinc-400 hover:text-white">
              <ChevronLeft size={20} />
            </Button>
            <div className="px-4 flex items-center gap-2 text-zinc-200 font-medium min-w-[160px] justify-center">
              <CalendarIcon size={16} className="text-zinc-500" />
              {capitalizedMonth}
            </div>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="text-zinc-400 hover:text-white">
              <ChevronRight size={20} />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => openModal(<NewTransactionModal type="income" />)}
              className="h-12 px-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black gap-3 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all duration-300 active:scale-95 group"
            >
              <div className="p-1.5 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
                <ArrowUpRight size={20} />
              </div>
              <span className="tracking-tight">Venda Rápida</span>
            </Button>
            <Button 
               onClick={() => openModal(<NewTransactionModal type="expense" />)}
              className="h-12 px-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black gap-3 hover:bg-rose-500/20 hover:border-rose-500/50 hover:shadow-[0_0_25px_rgba(244,63,94,0.15)] transition-all duration-300 active:scale-95 group"
            >
              <div className="p-1.5 bg-rose-500/10 rounded-lg group-hover:scale-110 transition-transform">
                <ArrowDownRight size={20} />
              </div>
              <span className="tracking-tight">Despesa Rápida</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-zinc-900/50 border border-white/5 p-1 rounded-xl h-auto flex-wrap justify-start">
          <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white rounded-lg py-2 px-6 gap-2">
            <Loader2 size={16} className={cn(loading && "animate-spin")} />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="receivables" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white rounded-lg py-2 px-6 gap-2">
            <ArrowUpRight size={16} />
            Receber
          </TabsTrigger>
          <TabsTrigger value="payables" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white rounded-lg py-2 px-6 gap-2">
            <ArrowDownRight size={16} />
            Pagar
          </TabsTrigger>
          <TabsTrigger value="clients" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white rounded-lg py-2 px-6 gap-2">
            <Users size={16} />
            Clientes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contas a Receber */}
            <SpotlightCard className="bg-black/40 border-emerald-500/20 backdrop-blur-sm p-6" spotlightColor="rgba(16, 185, 129, 0.15)" hoverBorderColor="rgba(16, 185, 129, 0.5)">
              <div className="flex flex-row items-center gap-3 pb-2 mb-4">
                 <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500">
                    <ArrowUpRight size={18} />
                 </div>
                 <h3 className="text-sm font-bold text-zinc-300">Contas a Receber</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Recebido</span>
                  <span className="text-emerald-500 font-bold">{formatCurrency(receivedTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Pendente</span>
                  <span className="text-blue-500 font-bold">{formatCurrency(pendingIncome)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Vencido</span>
                  <span className="text-rose-500 font-bold">{formatCurrency(overdueIncome)}</span>
                </div>
                <div className="pt-3 border-t border-white/5 flex justify-between">
                  <span className="text-zinc-200 font-bold">Total</span>
                  <span className="text-white font-bold">{formatCurrency(totalIncome)}</span>
                </div>
              </div>
            </SpotlightCard>

            {/* Contas a Pagar */}
            <SpotlightCard className="bg-black/40 border-emerald-500/20 backdrop-blur-sm p-6" spotlightColor="rgba(244, 63, 94, 0.15)" hoverBorderColor="rgba(244, 63, 94, 0.5)">
              <div className="flex flex-row items-center gap-3 pb-2 mb-4">
                 <div className="bg-rose-500/10 p-2 rounded-lg text-rose-500">
                    <ArrowDownRight size={18} />
                 </div>
                 <h3 className="text-sm font-bold text-zinc-300">Contas a Pagar</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Pago</span>
                  <span className="text-emerald-500 font-bold">{formatCurrency(paidTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Pendente</span>
                  <span className="text-blue-500 font-bold">{formatCurrency(pendingExpense)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Vencido</span>
                  <span className="text-rose-500 font-bold">{formatCurrency(overdueExpense)}</span>
                </div>
                <div className="pt-3 border-t border-white/5 flex justify-between">
                  <span className="text-zinc-200 font-bold">Total</span>
                  <span className="text-white font-bold">{formatCurrency(totalExpense)}</span>
                </div>
              </div>
            </SpotlightCard>

            {/* Lucro do Período */}
            <SpotlightCard className="bg-black/40 border-emerald-500/20 backdrop-blur-sm p-6" spotlightColor="rgba(255, 255, 255, 0.1)" hoverBorderColor="rgba(255, 255, 255, 0.3)">
              <div className="flex flex-row items-center gap-3 pb-2 mb-4">
                 <div className="bg-zinc-800 p-2 rounded-lg text-white">
                    <DollarSign size={18} />
                 </div>
                 <h3 className="text-sm font-bold text-zinc-300">Lucro do Período</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Receitas</span>
                  <span className="text-emerald-500 font-bold">{formatCurrency(receivedTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Despesas</span>
                  <span className="text-rose-500 font-bold">{formatCurrency(paidTotal)}</span>
                </div>
                <div className="pt-8 border-t border-white/5 flex justify-between items-end">
                   <div>
                      <span className="text-zinc-400 text-xs block mb-1">Lucro Líquido</span>
                      <span className={cn("text-2xl font-black", netProfit >= 0 ? "text-emerald-500" : "text-rose-500")}>
                        {formatCurrency(netProfit)}
                      </span>
                   </div>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Transaction Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Transações</h3>
            
            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] bg-zinc-900 border-white/10 rounded-xl px-3 py-2 h-10 text-zinc-200">
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10">
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="paid">Pagas</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[160px] bg-zinc-900 border-white/10 rounded-xl px-3 py-2 h-10 text-zinc-200">
                  <SelectValue placeholder="Categorias" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10">
                  <SelectItem value="all">Categorias</SelectItem>
                  <SelectItem value="services">Serviços</SelectItem>
                  <SelectItem value="fixed">Custos Fixos</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal bg-zinc-900 border-white/10 rounded-xl h-10 text-zinc-200 hover:bg-zinc-800",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yy")} -{" "}
                          {format(dateRange.to, "dd/MM/yy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yy")
                      )
                    ) : (
                      <span>Selecionar período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-zinc-950 border-white/10" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                    numberOfMonths={2}
                    locale={ptBR}
                    className="bg-transparent"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Table Area */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden min-h-[300px]">
               <Table>
                 <TableHeader className="bg-zinc-900/50">
                    <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead className="text-zinc-400 font-bold">Resumo</TableHead>
                        <TableHead className="text-zinc-400 font-bold">Categoria</TableHead>
                        <TableHead className="text-zinc-400 font-bold">Vencimento</TableHead>
                        <TableHead className="text-zinc-400 font-bold">Status</TableHead>
                        <TableHead className="text-zinc-400 font-bold text-right">Valor</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-20">
                                <Loader2 className="animate-spin size-8 text-emerald-500 mx-auto" />
                                <p className="text-zinc-500 mt-2 text-sm">Carregando transações...</p>
                            </TableCell>
                        </TableRow>
                    ) : filteredTransactions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-20">
                                <p className="text-zinc-500 text-sm">Nenhuma transação encontrada com os filtros atuais.</p>
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredTransactions.map(t => (
                            <TableRow key={t.id} className="border-white/5 hover:bg-white/2 transition-colors group">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-zinc-200 font-medium">{t.description}</span>
                                        <span className="text-xs text-zinc-500">#TRN-{t.id.slice(0,4).toUpperCase()}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-zinc-800 border-white/5 text-zinc-400 text-[10px] uppercase tracking-wider">
                                        {t.category || "Geral"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-zinc-400 text-sm">
                                    {new Date(t.due_date).toLocaleDateString('pt-BR')}
                                </TableCell>
                                <TableCell>
                                    <Badge className={cn(
                                        "text-[10px] uppercase font-bold px-2 py-0.5 rounded-md",
                                        t.status === 'paid' ? "bg-linear-to-br from-emerald-500/10 to-transparent text-emerald-500" :
                                        t.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                                        "bg-linear-to-br from-rose-500/10 to-transparent text-rose-500"
                                    )}>
                                        {t.status === 'paid' ? "Liquidado" : 
                                         t.status === 'pending' ? "Pendente" : "Atrasado"}
                                    </Badge>
                                </TableCell>
                                <TableCell className={cn("text-right font-bold", t.type === 'income' ? "text-emerald-500" : "text-rose-500")}>
                                    {t.type === 'income' ? "+" : "-"} {formatCurrency(t.amount)}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                 </TableBody>
               </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="receivables">
           <ReceivablesView month={selectedDate} />
        </TabsContent>

        <TabsContent value="payables">
           <PayablesView month={selectedDate} />
        </TabsContent>

        <TabsContent value="clients">
           <ClientsFinanceView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
