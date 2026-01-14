"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, ClientFormValues } from "@/lib/schemas/client";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

function FormField({ label, error, required, children }: { label: string, error?: string, required?: boolean, children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-300">
                {label} {required && <span className="text-pink-500">*</span>}
            </Label>
            {children}
            {error && <span className="text-red-500 text-xs">{error}</span>}
        </div>
    )
}

export default function CadastroPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      cpfCnpj: "",
      cep: "",
      address: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      observations: ""
    }
  });

  const { register, handleSubmit, formState: { errors } } = form;

  async function onSubmit(data: ClientFormValues) {
    setLoading(true);
    
    // Insert into Supabase
    const { error } = await supabase.from('clients').insert([{
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        cpf_cnpj: data.cpfCnpj,
        cep: data.cep,
        address: data.address,
        number: data.number,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        observations: data.observations,
        status: 'pending', // Could be 'pending' or 'active'
        source: 'public_form',
        created_at: new Date().toISOString()
    }]);

    setLoading(false);

    if (!error) {
        setSubmitted(true);
    } else {
        console.error(error);
        alert("Ocorreu um erro ao enviar seu cadastro. Tente novamente.");
    }
  }

  if (submitted) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl max-w-md w-full text-center space-y-6 shadow-2xl shadow-pink-500/10">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                    <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-white">Cadastro Realizado!</h1>
                <p className="text-zinc-400">
                    Seus dados foram enviados com sucesso para nossa equipe. Em breve entraremos em contato.
                </p>
                <Button 
                    onClick={() => window.location.reload()}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
                >
                    Voltar / Novo Cadastro
                </Button>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-2xl w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-linear-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-500/20 mb-6">
                <UserPlus size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Cadastro de Cliente</h1>
            <p className="text-zinc-400 max-w-md mx-auto">
                Preencha seus dados para se cadastrar em nossa base e agilizar seu atendimento.
            </p>
        </div>

        {/* Form */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 p-8 rounded-2xl shadow-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Section: Dados Pessoais */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                        Dados Pessoais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Nome Completo" required error={errors.name?.message}>
                            <Input placeholder="Seu nome completo" {...register("name")} className="bg-zinc-950 border-white/10 h-11" />
                        </FormField>
                        <FormField label="E-mail" required error={errors.email?.message}>
                            <Input placeholder="seu@email.com" {...register("email")} className="bg-zinc-950 border-white/10 h-11" />
                        </FormField>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Telefone / WhatsApp" required error={errors.phone?.message}>
                            <Input placeholder="(00) 00000-0000" {...register("phone")} className="bg-zinc-950 border-white/10 h-11" />
                        </FormField>
                        <FormField label="CPF / CNPJ" required error={errors.cpfCnpj?.message}>
                            <Input placeholder="000.000.000-00" {...register("cpfCnpj")} className="bg-zinc-950 border-white/10 h-11" />
                        </FormField>
                    </div>
                </div>

                {/* Section: Empresa */}
                <div className="space-y-4">
                     <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                        Empresa
                    </h3>
                    <FormField label="Nome da Empresa" error={errors.company?.message}>
                        <Input placeholder="Nome da empresa (opcional)" {...register("company")} className="bg-zinc-950 border-white/10 h-11" />
                    </FormField>
                </div>

                {/* Section: Endereço */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                        Endereço
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                             <FormField label="CEP" required error={errors.cep?.message}>
                                <Input placeholder="00000-000" {...register("cep")} className="bg-zinc-950 border-white/10 h-11" />
                            </FormField>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_100px] gap-4">
                         <FormField label="Rua / Logradouro" required error={errors.address?.message}>
                            <Input placeholder="Nome da rua" {...register("address")} className="bg-zinc-950 border-white/10 h-11" />
                        </FormField>
                         <FormField label="Número" required error={errors.number?.message}>
                            <Input placeholder="123" {...register("number")} className="bg-zinc-950 border-white/10 h-11" />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Bairro" required error={errors.neighborhood?.message}>
                            <Input placeholder="Bairro" {...register("neighborhood")} className="bg-zinc-950 border-white/10 h-11" />
                        </FormField>
                        <FormField label="Cidade" required error={errors.city?.message}>
                            <Input placeholder="Cidade" {...register("city")} className="bg-zinc-950 border-white/10 h-11" />
                        </FormField>
                        <FormField label="Estado" required error={errors.state?.message}>
                            <Input placeholder="UF" {...register("state")} className="bg-zinc-950 border-white/10 h-11" />
                        </FormField>
                    </div>
                </div>

                 {/* Section: Observações */}
                 <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                        Observações
                    </h3>
                    <FormField label="" error={errors.observations?.message}>
                        <textarea 
                            {...register("observations")}
                            rows={3}
                            placeholder="Alguma informação adicional que deseja compartilhar?"
                            className="w-full bg-zinc-950 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-zinc-600 resize-none text-sm"
                        />
                    </FormField>
                </div>

                <div className="pt-4">
                    <Button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full h-12 text-lg font-bold bg-linear-to-r from-pink-500 to-orange-500 hover:opacity-90 shadow-lg shadow-pink-500/20 transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Enviar Cadastro'}
                    </Button>
                </div>

            </form>
        </div>
      </div>
    </div>
  );
}
