import { z } from "zod";

export const quoteStatusEnum = z.enum(['rascunho', 'enviado', 'aprovado', 'rejeitado', 'arquivado']);

export const quoteItemSchema = z.object({
  id: z.string().optional(),
  servico_id: z.string().nullable().optional(),
  nome_item: z.string().min(1, "Nome do item é obrigatório"),
  descricao: z.string().optional(),
  quantidade: z.number().min(1, "Quantidade deve ser pelo menos 1"),
  valor_unitario: z.number().min(0, "Valor não pode ser negativo"),
  valor_total: z.number().optional(),
});

export const paymentConditionSchema = z.object({
  prazo_entrega: z.string().min(1, "Prazo de entrega é obrigatório"),
  data_validade: z.string().min(1, "Data de validade é obrigatória"), // YYYY-MM-DD
  forma_pagamento_config: z.record(z.string(), z.any()).optional(),
});

export const quoteSchema = z.object({
  id: z.string().optional(),
  cliente_id: z.string().min(1, "Cliente é obrigatório"),
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  status: quoteStatusEnum.default('rascunho'),
  
  // Financials
  subtotal: z.number().default(0),
  desconto: z.number().default(0),
  total: z.number().default(0),

  // Branding
  cor_primaria: z.string().default('#EC4899'),
  cor_secundaria: z.string().default('#A855F7'),
  logo_customizado: z.string().optional(),

  // Relations
  itens: z.array(quoteItemSchema).optional(),
})
.merge(paymentConditionSchema);

export type QuoteItem = z.infer<typeof quoteItemSchema>;
export type Quote = z.infer<typeof quoteSchema>;
export type QuoteStatus = z.infer<typeof quoteStatusEnum>;
