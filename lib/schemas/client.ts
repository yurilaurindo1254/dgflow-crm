import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  email: z.string().email("E-mail inválido."),
  phone: z.string().min(10, "Telefone inválido (mínimo 10 dígitos)."),
  company: z.string().optional(),
  cpfCnpj: z.string().min(11, "CPF/CNPJ inválido (mínimo 11 caracteres)."),
  cep: z.string().min(8, "CEP inválido."),
  address: z.string().min(2, "Endereço é obrigatório."),
  number: z.string().min(1, "Número é obrigatório."),
  neighborhood: z.string().min(2, "Bairro é obrigatório."),
  city: z.string().min(2, "Cidade é obrigatória."),
  state: z.string().length(2, "Estado deve ter 2 letras."),
  project: z.string().optional(),
  value: z.string().optional(),
  tags: z.string().optional(),
  observations: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
