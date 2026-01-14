"use client";

import { UseFormReturn, FieldValues, Controller } from "react-hook-form";
import { Quote } from "@/lib/schemas/quote";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PaymentConditionsProps {
  form: UseFormReturn<FieldValues>;
}

export function PaymentConditions({ form }: PaymentConditionsProps) {
  const { register, control, formState: { errors } } = form as unknown as UseFormReturn<Quote>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2 flex flex-col">
            <Label>Data de Validade da Proposta</Label>
            <Controller
                control={control}
                name="data_validade"
                render={({ field }) => (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full text-left font-normal bg-zinc-900 border-white/10 hover:bg-zinc-800 hover:text-white",
                                    !field.value && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(parseISO(field.value), "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-zinc-950 border-zinc-800" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value ? parseISO(field.value) : undefined}
                                onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                initialFocus
                                locale={ptBR}
                                className="pointer-events-auto"
                            />
                        </PopoverContent>
                    </Popover>
                )}
            />
            {errors.data_validade && <p className="text-red-500 text-xs">{errors.data_validade.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label>Prazo de Entrega Estimado</Label>
            <Input 
              {...register("prazo_entrega")}
              placeholder="Ex: 15 dias úteis" 
              className="bg-zinc-900 border-white/10 focus-visible:ring-primary-500/50"
            />
             {errors.prazo_entrega && <p className="text-red-500 text-xs">{errors.prazo_entrega.message as string}</p>}
          </div>

      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
          <Label className="text-lg font-medium">Personalização (Branding)</Label>
          <div className="flex flex-wrap gap-6">
              <div>
                  <label className="text-xs text-zinc-500 block mb-2">Cor Primária</label>
                  <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                        <Input 
                            type="color"
                            {...register("cor_primaria")}
                            className="absolute -top-2 -left-2 w-16 h-16 p-0 border-none opacity-0 cursor-pointer"
                        />
                        <div 
                            className="w-full h-full"
                            style={{ backgroundColor: control._formValues.cor_primaria || '#EC4899' }}
                        />
                      </div>
                      <Input 
                        {...register("cor_primaria")}
                        className="w-28 bg-zinc-900 border-white/10 uppercase font-mono text-xs focus-visible:ring-primary-500/50"
                      />
                  </div>
              </div>
               <div>
                  <label className="text-xs text-zinc-500 block mb-2">Cor Secundária</label>
                  <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                        <Input 
                            type="color"
                            {...register("cor_secundaria")}
                            className="absolute -top-2 -left-2 w-16 h-16 p-0 border-none opacity-0 cursor-pointer"
                        />
                        <div 
                            className="w-full h-full"
                            style={{ backgroundColor: control._formValues.cor_secundaria || '#A855F7' }}
                        />
                      </div>
                       <Input 
                        {...register("cor_secundaria")}
                        className="w-28 bg-zinc-900 border-white/10 uppercase font-mono text-xs focus-visible:ring-primary-500/50"
                      />
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
