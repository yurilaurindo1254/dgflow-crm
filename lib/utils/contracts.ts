import { supabase } from "@/lib/supabase";

import { Quote, QuoteItem } from "../schemas/quote";

export interface ClientData {
    id: string;
    name: string;
    cpf_cnpj?: string;
    address?: string;
    number?: string;
    city?: string;
    state?: string;
    neighborhood?: string;
}

// Helper to get template and generate content string WITHOUT saving
export async function getContractPreview({ quote, overrides }: { 
    quote: Partial<Quote> & { clients?: ClientData },
    overrides?: {
        paymentMethod?: string;
        installments?: string;
        conditions?: string;
        services?: string;
    }
}) {
    try {
        const { data: template } = await supabase
            .from('modelos_contrato')
            .select('*')
            .eq('ativo', true)
            .limit(1)
            .maybeSingle();

        if (!template) {
            throw new Error("Nenhum modelo de contrato ativo encontrado.");
        }

        let content = template.conteudo;
        const client = quote.clients;

        // Basic replacements
        content = content.replace(/{{Nome do Cliente}}/g, client?.name || "Cliente");
        content = content.replace(/{{Endereço do Cliente}}/g, client?.address || "Endereço não informado");
        content = content.replace(/{{Número do Endereço Cliente}}/g, client?.number || "S/N");
        content = content.replace(/{{Bairro do Cliente}}/g, client?.neighborhood || "");
        content = content.replace(/{{Cidade do Cliente}}/g, client?.city || "");
        content = content.replace(/{{Estado do Cliente}}/g, client?.state || "");
        content = content.replace(/{{CPF\/CNPJ do Cliente}}/g, client?.cpf_cnpj || "");
        content = content.replace(/{{Representante do Cliente}}/g, client?.name || "Representante");

        // Provider Replacements (TODO: Fetch from settings)
        content = content.replace(/{{Nome do Prestador}}/g, "PRESTADOR DE SERVIÇOS"); 
        content = content.replace(/{{Endereço do Prestador}}/g, "Endereço do Prestador");
        content = content.replace(/{{Número do Endereço Prestador}}/g, "");
        content = content.replace(/{{Bairro do Prestador}}/g, "");
        content = content.replace(/{{Cidade do Prestador}}/g, "Cidade");
        content = content.replace(/{{Estado do Prestador}}/g, "UF");
        content = content.replace(/{{CPF\/CNPJ do Prestador}}/g, "00.000.000/0001-00");

        content = content.replace(/{{Nome do Projeto}}/g, quote.titulo || "Projeto");

        if (overrides?.services) {
            content = content.replace(/{{Serviços Inclusos}}/g, overrides.services);
        } else if (quote.itens && Array.isArray(quote.itens)) {
             const servicesList = (quote.itens as QuoteItem[]).map((i: QuoteItem) => `${i.nome_item} (${i.quantidade}x)`).join(', ');
             content = content.replace(/{{Serviços Inclusos}}/g, servicesList);
        } else {
             content = content.replace(/{{Serviços Inclusos}}/g, "Ver proposta anexa");
        }

        content = content.replace(/{{Valor Total}}/g, `R$ ${quote.subtotal?.toFixed(2) || '0.00'}`);
        content = content.replace(/{{Valor do Desconto}}/g, `R$ ${quote.desconto?.toFixed(2) || '0.00'}`);
        content = content.replace(/{{Valor Final}}/g, `R$ ${quote.total?.toFixed(2) || '0.00'}`);
        content = content.replace(/{{Data}}/g, new Date().toLocaleDateString());
        content = content.replace(/{{Titulo}}/g, quote.titulo || "Proposta");
        content = content.replace(/{{Prazo do Contrato}}/g, quote.prazo_entrega ? `${quote.prazo_entrega} dias` : "A combinar");

        // Payment Conditions (Using Overrides)
        content = content.replace(/{{Condições de Pagamento}}/g, overrides?.conditions || "A combinar");
        content = content.replace(/{{Forma de Pagamento}}/g, overrides?.paymentMethod || "Transferência/Boleto");
        content = content.replace(/{{Número de Parcelas}}/g, overrides?.installments ? `${overrides.installments}x` : "1x");
        
        return content;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// Main function to Generate and SAVE
export async function generateContract({ quote, onUpdate }: { quote: Quote & { clients?: ClientData }, onUpdate?: () => void }) {
    try {
        // Check existing
        const { data: existing } = await supabase
            .from('contratos')
            .select('id')
            .eq('orcamento_id', quote.id)
            .single();

        if (existing) {
            const overwrite = window.confirm("Já existe um contrato gerado para este orçamento. Deseja sobrescrever (gerar novo)?");
            if (!overwrite) {
                return false;
            }
        }

        const content = await getContractPreview({ quote });
        
        if (!content) {
            alert("Erro ao gerar conteúdo do contrato. Verifique se há um modelo ativo.");
            return false;
        }

        // Insert Contract
        const { error } = await supabase.from('contratos').insert({
            orcamento_id: quote.id,
            conteudo_final: content,
            status: 'pendente'
        });

        if (error) throw error;

        alert("📄 Contrato gerado com sucesso!");
        if (onUpdate) onUpdate();
        return true;

    } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : "Desconhecido";
        alert(`Erro ao gerar contrato: ${errorMessage}`);
        return false;
    }
}
