"use client";

import { Modal } from "@/components/ui/modal";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, ClientFormValues } from "@/lib/schemas/client";
import { supabase } from "@/lib/supabase";
import { useModal } from "@/contexts/modal-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

// Helper component for easier form fields
function FormField({ label, error, children }: { label: string, error?: string, children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <Label className="uppercase text-xs font-bold text-zinc-500 tracking-wide">{label}</Label>
            {children}
            {error && <span className="text-red-500 text-xs">{error}</span>}
        </div>
    )
}

interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    cpf_cnpj?: string;
    cep?: string;
    address?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    project?: string;
    // value?: string; // Add if needed
    // tags?: string; // Add if needed
    // observations?: string; // Add if needed
}

interface ClientDetailsModalProps {
    client?: Client;
}

export function ClientDetailsModal({ client }: ClientDetailsModalProps) {
    const { closeModal } = useModal();
    const [loading, setLoading] = useState(false);

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientSchema),
        defaultValues: client || {
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
            project: "",
            value: "",
            tags: "",
            observations: ""
        }
    });

    const { register, handleSubmit, formState: { errors } } = form;

    async function onSubmit(data: ClientFormValues) {
        setLoading(true);
        
        const payload = {
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
            // Additional fields logic if your DB supports them or map them correctly
            // project: data.project, // Assuming DB has these or standardizing names
            // value: data.value,
            // tags: data.tags,
            // observations: data.observations,
            updated_at: new Date().toISOString()
        };

        let result;
        if (client?.id) {
            // Update
            result = await supabase.from('clients').update(payload).eq('id', client.id);
        } else {
            // Create
            result = await supabase.from('clients').insert([{ ...payload, status: 'active' }]);
        }

        setLoading(false);
        const { error } = result;

        if (!error) {
            closeModal();
            window.location.reload(); // Simple refresh for MVP
        } else {
            console.error(error);
            alert("Erro ao salvar cliente. Verifique os dados.");
        }
    }

    return (
        <Modal title={client ? "Detalhes do Cliente" : "Novo Cliente"}>
            <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-zinc-900/50 p-1 mb-6">
                    <TabsTrigger value="info" type="button">Informações</TabsTrigger>
                    <TabsTrigger value="services" type="button">Serviços</TabsTrigger>
                    <TabsTrigger value="financial" type="button">Financeiro</TabsTrigger>
                </TabsList>

                <TabsContent value="info">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar p-1">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Nome do Cliente" error={errors.name?.message}>
                                <Input placeholder="Ex: Ana Costa" {...register("name")} className="bg-zinc-950 border-white/10" />
                            </FormField>
                            <FormField label="E-mail" error={errors.email?.message}>
                                <Input placeholder="cliente@email.com" {...register("email")} className="bg-zinc-950 border-white/10" />
                            </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Telefone" error={errors.phone?.message}>
                                <Input placeholder="(00) 00000-0000" {...register("phone")} className="bg-zinc-950 border-white/10" />
                            </FormField>
                            <FormField label="Empresa" error={errors.company?.message}>
                                <Input placeholder="Nome da empresa" {...register("company")} className="bg-zinc-950 border-white/10" />
                            </FormField>
                        </div>

                        <FormField label="CPF/CNPJ" error={errors.cpfCnpj?.message}>
                            <div className="flex gap-2">
                                <Input placeholder="00.000.000/0000-00" {...register("cpfCnpj")} className="bg-zinc-950 border-white/10" />
                                <button type="button" className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg px-4 border border-white/10 transition-colors">
                                    <Search size={18} />
                                </button>
                            </div>
                        </FormField>

                        <FormField label="CEP" error={errors.cep?.message}>
                            <Input placeholder="00000-000" {...register("cep")} className="bg-zinc-950 border-white/10" />
                        </FormField>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <FormField label="Endereço" error={errors.address?.message}>
                                    <Input placeholder="Rua, Avenida..." {...register("address")} className="bg-zinc-950 border-white/10" />
                                </FormField>
                            </div>
                            <div className="w-24">
                                <FormField label="Número" error={errors.number?.message}>
                                    <Input placeholder="Nº" {...register("number")} className="bg-zinc-950 border-white/10" />
                                </FormField>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField label="Bairro" error={errors.neighborhood?.message}>
                                <Input placeholder="Bairro" {...register("neighborhood")} className="bg-zinc-950 border-white/10" />
                            </FormField>
                            <FormField label="Cidade" error={errors.city?.message}>
                                <Input placeholder="Cidade" {...register("city")} className="bg-zinc-950 border-white/10" />
                            </FormField>
                            <FormField label="Estado" error={errors.state?.message}>
                                <Input placeholder="UF" {...register("state")} className="bg-zinc-950 border-white/10" />
                            </FormField>
                        </div>

                        <FormField label="Projeto" error={errors.project?.message}>
                            <Input placeholder="Ex: Logo + Identidade Visual" {...register("project")} className="bg-zinc-950 border-white/10" />
                        </FormField>

                        {/* Additional form actions */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 mt-6 sticky bottom-0 bg-background/95 backdrop-blur-sm pb-2">
                             <Button type="button" variant="outline" onClick={() => closeModal()} className="h-12 border-white/10 hover:bg-white/5">
                                 Cancelar
                             </Button>
                             <Button type="submit" disabled={loading} className="h-12 bg-linear-to-r from-pink-500 to-orange-500 hover:opacity-90 transition-all">
                                 {loading ? <Loader2 className="animate-spin" /> : (client ? 'Salvar Alterações' : 'Criar Cliente')}
                             </Button>
                        </div>
                    </form>
                </TabsContent>

                <TabsContent value="services" className="min-h-[300px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-zinc-900/20">
                    <p className="text-zinc-500 font-medium">Histórico de serviços em breve...</p>
                </TabsContent>

                <TabsContent value="financial" className="min-h-[300px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-zinc-900/20">
                    <p className="text-zinc-500 font-medium">Histórico financeiro em breve...</p>
                </TabsContent>
            </Tabs>
        </Modal>
    );
}
