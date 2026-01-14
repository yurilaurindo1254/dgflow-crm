"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { getContractPreview } from "@/lib/utils/contracts";
import { FileText, Loader2, Plus, Search, ChevronRight, ChevronLeft, Eye, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Quote } from "@/lib/schemas/quote";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Wizard Steps
type Step = 'SELECT_QUOTE' | 'BASIC_DATA' | 'CLIENT_DATA' | 'FINANCIAL_DATA' | 'PREVIEW';

interface ClientData {
    id: string;
    name: string;
    cpf_cnpj?: string;
    address?: string;
    number?: string;
    city?: string;
    state?: string;
    neighborhood?: string;
}

interface QuoteWithClient extends Quote {
    id: string;
    clients: ClientData;
}

export function NewContractModal({ onUpdate }: { onUpdate: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // State
    const [step, setStep] = useState<Step>('SELECT_QUOTE');
    const [quotes, setQuotes] = useState<QuoteWithClient[]>([]);
    const [search, setSearch] = useState("");
    
    // Selection
    const [selectedQuote, setSelectedQuote] = useState<QuoteWithClient | null>(null);

    // Form Data (Wizard)
    const [formData, setFormData] = useState({
        // Basic
        projectTitle: "",
        duration: "",
        services: "",
        // Client
        clientName: "",
        clientCpfCnpj: "",
        clientAddress: "",
        clientNumber: "",
        clientCity: "",
        clientState: "",
        clientRep: "",
        // Financial
        totalValue: "",
        discount: "",
        finalValue: "",
        paymentMethod: "",
        installments: "",
        conditions: "",
    });

    // Preview
    const [previewContent, setPreviewContent] = useState("");

    const fetchApprovedQuotes = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('orcamentos')
            .select(`
                *,
                clients(*)
            `)
            .eq('status', 'aprovado')
            .order('created_at', { ascending: false });

        if (data) setQuotes(data as QuoteWithClient[]);
        setLoading(false);
    };

    const resetWizard = () => {
        setStep('SELECT_QUOTE');
        setSelectedQuote(null);
        setPreviewContent("");
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            fetchApprovedQuotes();
        } else {
            resetWizard();
        }
    };

    // Initialize Form Data when Quote is selected
    useEffect(() => {
        if (selectedQuote) {
            const client = selectedQuote.clients;
            
            // Format services list
            let servicesList = "";
            if (selectedQuote.itens && Array.isArray(selectedQuote.itens)) {
                servicesList = (selectedQuote.itens as any[]).map((i: any) => `${i.nome_item} (${i.quantidade}x)`).join(', ');
            }

            setFormData({
                projectTitle: selectedQuote.titulo || "",
                duration: selectedQuote.prazo_entrega || "",
                services: servicesList || "Ver proposta anexa",
                
                clientName: client?.name || "",
                clientCpfCnpj: client?.cpf_cnpj || "",
                clientAddress: client?.address || "",
                clientNumber: client?.number || "",
                clientCity: client?.city || "",
                clientState: client?.state || "",
                clientRep: client?.name || "", // Often same as client name for individuals

                totalValue: (selectedQuote.subtotal || 0).toFixed(2),
                discount: (selectedQuote.desconto || 0).toFixed(2),
                finalValue: (selectedQuote.total || 0).toFixed(2),
                paymentMethod: "Boleto",
                installments: "1",
                conditions: "À vista",
            });
        }
    }, [selectedQuote]);

    const handleSelectQuote = (quote: any) => {
        setSelectedQuote(quote);
        setStep('BASIC_DATA');
    };

    const handleNext = async () => {
        if (step === 'BASIC_DATA') setStep('CLIENT_DATA');
        else if (step === 'CLIENT_DATA') setStep('FINANCIAL_DATA');
        else if (step === 'FINANCIAL_DATA') {
            await loadPreview();
            setStep('PREVIEW');
        }
    };

    const handleBack = () => {
        if (step === 'BASIC_DATA') setStep('SELECT_QUOTE');
        else if (step === 'CLIENT_DATA') setStep('BASIC_DATA');
        else if (step === 'FINANCIAL_DATA') setStep('CLIENT_DATA');
        else if (step === 'PREVIEW') setStep('FINANCIAL_DATA');
    };


    const loadPreview = async () => {
        if (!selectedQuote) return;
        setLoading(true);

        // Map form data to overrides for the preview/generation helper
        const overrides = {
            paymentMethod: formData.paymentMethod,
            installments: formData.installments,
            conditions: formData.conditions,
            services: formData.services,
        };

        // Inject form data back into quote object alias for basic field overrides (Title, Client Info)
        const tempQuote = {
            ...selectedQuote,
            titulo: formData.projectTitle,
            prazo_entrega: formData.duration,
            clients: {
                ...selectedQuote.clients,
                name: formData.clientName,
                cpf_cnpj: formData.clientCpfCnpj,
                address: formData.clientAddress,
                number: formData.clientNumber,
                city: formData.clientCity,
                state: formData.clientState,
            },
            // Financials
            total: parseFloat(formData.finalValue) || 0,
            desconto: parseFloat(formData.discount) || 0,
            subtotal: parseFloat(formData.totalValue) || 0, 
        };

        const content = await getContractPreview({ quote: tempQuote, overrides });
        if (content) setPreviewContent(content);
        
        setLoading(false);
    };

    const handleGenerate = async () => {
        if (!selectedQuote) return;
        setLoading(true);

        // Save Final Contract
        const { error } = await supabase.from('contratos').insert({
            orcamento_id: selectedQuote.id,
            conteudo_final: previewContent, // User might have edited preview text? Not implementing textarea for preview edit yet to keep it simple, but we save the generated one.
            status: 'pendente'
        });

        setLoading(false);

        if (error) {
            console.error(error);
            alert("Erro ao gerar contrato.");
        } else {
            alert("Contrato gerado com sucesso!");
            setOpen(false);
            if (onUpdate) onUpdate();
        }
    };

    const filteredQuotes = quotes.filter(q => 
        q.titulo.toLowerCase().includes(search.toLowerCase()) || 
        q.clients?.name?.toLowerCase().includes(search.toLowerCase())
    );

    // --- RENDERERS ---

    const renderSelectQuote = () => (
        <div className="space-y-4">
             <div className="relative">
                <Input 
                    placeholder="Buscar orçamento aprovado..." 
                    className="pl-9 bg-black/20 border-white/10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            </div>

            <div className="space-y-2 mt-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <div className="text-center py-8 text-zinc-500">Carregando...</div>
                ) : filteredQuotes.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 border border-dashed border-white/10 rounded-lg">
                        Nenhum orçamento aprovado disponível.
                    </div>
                ) : (
                    filteredQuotes.map(quote => (
                        <div key={quote.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/5 cursor-pointer" onClick={() => handleSelectQuote(quote)}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-primary-500/10 text-primary-500">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-white">{quote.titulo}</p>
                                    <p className="text-sm text-zinc-400">{quote.clients?.name || "Cliente"} • R$ {quote.total?.toFixed(2)}</p>
                                </div>
                            </div>
                            <ChevronRight className="text-zinc-500" size={16} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderWizard = () => (
        <div className="space-y-6">
            {/* Tabs / Progress */}
            <div className="flex border-b border-white/10 mb-4">
                <button className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${step === 'BASIC_DATA' ? 'border-primary-500 text-white' : 'border-transparent text-zinc-500'}`}>Dados Básicos</button>
                <button className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${step === 'CLIENT_DATA' ? 'border-primary-500 text-white' : 'border-transparent text-zinc-500'}`}>Dados do Cliente</button>
                <button className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${step === 'FINANCIAL_DATA' ? 'border-primary-500 text-white' : 'border-transparent text-zinc-500'}`}>Dados Financeiros</button>
            </div>

            {/* Steps Content */}
            <div className="space-y-4">
                {step === 'BASIC_DATA' && (
                    <>
                        <div className="space-y-2">
                             <Label>Cliente *</Label>
                             <div className="p-3 bg-zinc-800 rounded border border-white/10 text-zinc-300">{formData.clientName}</div>
                        </div>
                        <div className="space-y-2">
                            <Label>Nome do Projeto *</Label>
                            <Input value={formData.projectTitle} onChange={(e) => setFormData({...formData, projectTitle: e.target.value})} className="bg-zinc-900 border-white/10" />
                        </div>
                        <div className="space-y-2">
                             <Label>Serviços Inclusos</Label>
                             <Textarea value={formData.services} onChange={(e) => setFormData({...formData, services: e.target.value})} className="bg-zinc-900 border-white/10 min-h-[100px]" />
                        </div>
                         <div className="space-y-2">
                            <Label>Duração do Contrato</Label>
                            <Input value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="bg-zinc-900 border-white/10" />
                        </div>
                    </>
                )}

                {step === 'CLIENT_DATA' && (
                     <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nome/Razão Social</Label>
                                <Input value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} className="bg-zinc-900 border-white/10" />
                            </div>
                            <div className="space-y-2">
                                <Label>Representante</Label>
                                <Input value={formData.clientRep} onChange={(e) => setFormData({...formData, clientRep: e.target.value})} className="bg-zinc-900 border-white/10" />
                            </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>CPF/CNPJ</Label>
                                <Input value={formData.clientCpfCnpj} onChange={(e) => setFormData({...formData, clientCpfCnpj: e.target.value})} className="bg-zinc-900 border-white/10" />
                            </div>
                             <div className="space-y-2">
                                <Label>Cidade</Label>
                                <Input value={formData.clientCity} onChange={(e) => setFormData({...formData, clientCity: e.target.value})} className="bg-zinc-900 border-white/10" />
                            </div>
                        </div>
                         <div className="grid grid-cols-[3fr_1fr] gap-4">
                            <div className="space-y-2">
                                <Label>Endereço</Label>
                                <Input value={formData.clientAddress} onChange={(e) => setFormData({...formData, clientAddress: e.target.value})} className="bg-zinc-900 border-white/10" />
                            </div>
                             <div className="space-y-2">
                                <Label>Número</Label>
                                <Input value={formData.clientNumber} onChange={(e) => setFormData({...formData, clientNumber: e.target.value})} className="bg-zinc-900 border-white/10" />
                            </div>
                        </div>
                     </>
                )}

                {step === 'FINANCIAL_DATA' && (
                     <>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Valor Total *</Label>
                                <Input value={formData.totalValue} onChange={(e) => setFormData({...formData, totalValue: e.target.value})} className="bg-zinc-900 border-white/10" />
                            </div>
                            <div className="space-y-2">
                                <Label>Desconto</Label>
                                <Input value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} className="bg-zinc-900 border-white/10" />
                            </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Valor Final</Label>
                                <div className="p-3 bg-zinc-800 rounded border border-white/10 text-zinc-300 font-bold">R$ {formData.finalValue}</div>
                            </div>
                            <div className="space-y-2">
                                <Label>Parcelas</Label>
                                <Input value={formData.installments} onChange={(e) => setFormData({...formData, installments: e.target.value})} className="bg-zinc-900 border-white/10" />
                            </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label>Forma de Pagamento</Label>
                                <select 
                                    value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                                    className="w-full h-10 rounded-md border border-white/10 bg-zinc-900 px-3 text-sm text-white"
                                >
                                    <option>Boleto</option>
                                    <option>PIX</option>
                                    <option>Cartão de Crédito</option>
                                    <option>Transferência</option>
                                </select>
                            </div>
                             <div className="space-y-2">
                                <Label>Condições de Pagamento</Label>
                                <Input value={formData.conditions} onChange={(e) => setFormData({...formData, conditions: e.target.value})} className="bg-zinc-900 border-white/10" placeholder="Ex: 15 dias" />
                            </div>
                        </div>
                     </>
                )}
            </div>
        </div>
    );

    const renderPreview = () => (
        <div className="space-y-4 h-full flex flex-col">
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex items-start gap-3">
                <Eye className="text-amber-500 mt-1 shrink-0" size={18} />
                <div>
                   <p className="text-sm text-amber-200 font-bold mb-1">Revisão do Contrato</p>
                   <p className="text-xs text-amber-200/70">Verifique se todos os dados foram substituídos corretamente. Você pode editar o texto final abaixo antes de gerar.</p>
                </div>
            </div>

            <Textarea 
                value={previewContent} 
                onChange={(e) => setPreviewContent(e.target.value)} 
                className="flex-1 min-h-[400px] bg-white text-black font-mono text-sm leading-relaxed p-6 resize-none"
            />
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-primary-500 text-black hover:bg-primary-600 font-bold gap-2">
                    <Plus size={18} />
                    Novo Contrato
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-4xl max-h-[90vh] h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b border-white/10 bg-black/20">
                    <DialogTitle>
                        {step === 'SELECT_QUOTE' ? 'Novo Contrato' : 
                         step === 'PREVIEW' ? 'Visualizar Contrato' : 
                         'Novo Contrato - ' + selectedQuote?.titulo}
                    </DialogTitle>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                    {step === 'SELECT_QUOTE' && renderSelectQuote()}
                    {(step === 'BASIC_DATA' || step === 'CLIENT_DATA' || step === 'FINANCIAL_DATA') && renderWizard()}
                    {step === 'PREVIEW' && renderPreview()}
                </div>

                <DialogFooter className="px-6 py-4 border-t border-white/10 bg-zinc-900/50 flex justify-between items-center w-full">
                    
                    {step === 'SELECT_QUOTE' ? (
                        <div className="w-full flex justify-end">
                            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                        </div>
                    ) : (
                        <div className="flex justify-between w-full">
                            <Button variant="outline" onClick={handleBack} className="border-white/10 hover:bg-white/5 text-zinc-300">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Voltar
                            </Button>

                            {step === 'PREVIEW' ? (
                                <Button onClick={handleGenerate} disabled={loading} className="bg-primary-500 text-black hover:bg-primary-600 font-bold">
                                    {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                                    Gerar Contrato
                                </Button>
                            ) : (
                                <Button onClick={handleNext} className="bg-zinc-100 text-black hover:bg-white font-bold">
                                    {step === 'FINANCIAL_DATA' ? 'Visualizar Contrato' : 'Próximo'}
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
