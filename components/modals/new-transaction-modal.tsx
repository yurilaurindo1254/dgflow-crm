"use client";

import { Modal } from "@/components/ui/modal";
import { useState } from "react";
import { Plus, User, Clock, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useModal } from "@/contexts/modal-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface NewTransactionModalProps {
    type?: 'income' | 'expense';
}

const CATEGORIES = [
  "Serviços",
  "Infraestrutura",
  "Marketing",
  "Vendas",
  "Salários",
  "Impostos",
  "Outros",
];

export function NewTransactionModal({ type = 'income' }: NewTransactionModalProps) {
  const router = useRouter();
  const { closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    currency: "BRL",
    category: "Serviços",
    client: "",
    isPaid: false,
    observations: "",
  });

  async function handleSubmit() {
    if (!formData.description || !formData.amount) {
      alert("Por favor, preencha a descrição e o valor.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('transactions').insert([{
          description: formData.description,
          amount: parseFloat(formData.amount),
          type: type,
          due_date: date.toISOString(),
          category: formData.category,
          status: formData.isPaid ? 'paid' : 'pending',
          observations: formData.observations
      }]);

      if (error) throw error;

      router.refresh();
      closeModal();
    } catch (error) {
      alert('Erro ao criar transação');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const isIncome = type === 'income';

  return (
    <Modal title={isIncome ? "Nova Venda Rápida" : "Nova Despesa"}>
      <div className="space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar p-1">
        
        <p className="text-sm text-zinc-400 -mt-4 mb-4">
            {isIncome ? "Registre uma venda de forma rápida e prática" : "Registre uma saída financeira"}
        </p>

        {/* Client (Visual Only for now) */}
        <div className="space-y-2">
             <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Cliente (opcional)</Label>
             <div className="bg-zinc-950 border border-primary-500/20 rounded-xl p-3 flex items-center justify-between text-zinc-400 hover:border-primary-500/50 transition-colors cursor-not-allowed mb-2 group opacity-60">
                <div className="flex items-center gap-2">
                    <User size={18} />
                    <span>Venda rápida sem cliente</span>
                </div>
                 <Plus size={16} className="rotate-45" />
             </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Descrição *</Label>
            <Input 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={isIncome ? "Ex: Projeto de logo" : "Ex: Pagamento AWS"}
                className="bg-zinc-950 border-white/10"
            />
        </div>

        {/* Value Row */}
        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Valor *</Label>
                <Input 
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="bg-zinc-950 border-white/10"
                />
             </div>
             <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Moeda</Label>
                <Select 
                    value={formData.currency}
                    onValueChange={(val) => setFormData({ ...formData, currency: val })}
                >
                    <SelectTrigger className="bg-zinc-950 border-white/10">
                        <SelectValue placeholder="BRL" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-white/10">
                        <SelectItem value="BRL">BRL</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                </Select>
             </div>
        </div>

        {/* Category & Date Row */}
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Categoria</Label>
                <Select 
                    value={formData.category}
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                >
                    <SelectTrigger className="bg-zinc-950 border-white/10">
                        <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-white/10">
                        {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Data de Vencimento *</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal bg-zinc-950 border-white/10 hover:bg-zinc-900",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "P", { locale: ptBR }) : <span>Selecione</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-zinc-950 border-white/10" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => d && setDate(d)}
                            initialFocus
                            locale={ptBR}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>

        {/* Paid Toggle */}
        <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex items-center justify-between">
            <div className={cn("flex items-center gap-2 transition-colors", formData.isPaid ? "text-emerald-500" : "text-orange-400")}>
                <Clock className={cn("h-4 w-4", formData.isPaid && "text-emerald-500")} />
                <span className="text-sm font-medium">
                    {formData.isPaid ? "Pagamento Realizado" : "Ainda não foi pago"}
                </span>
            </div>
            <Switch 
                checked={formData.isPaid}
                onCheckedChange={(val) => setFormData({ ...formData, isPaid: val })}
            />
        </div>

        {/* Observations */}
        <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Observações (opcional)</Label>
            <Textarea 
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Adicione detalhes extras..."
                className="bg-zinc-950 border-white/10 min-h-[80px] resize-none"
            />
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-2 gap-4 pt-4 mt-6">
             <Button 
                variant="outline" 
                onClick={() => closeModal()} 
                className="bg-transparent border-white/10 text-white hover:bg-white/5 h-12 rounded-xl font-bold"
             >
                 Cancelar
             </Button>
             <Button 
                onClick={handleSubmit} 
                disabled={loading} 
                className={cn(
                    "h-12 rounded-xl font-bold transition-all shadow-lg", 
                    isIncome 
                        ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20" 
                        : "bg-rose-600 hover:bg-rose-500 shadow-rose-500/20"
                )}
             >
                 {loading ? 'Salvando...' : (isIncome ? "Lançar Venda" : "Lançar Despesa")}
             </Button>
        </div>

      </div>
    </Modal>
  );
}
