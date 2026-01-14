import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(2, "O nome do serviço deve ter pelo menos 2 caracteres."),
  description: z.string().min(5, "A descrição deve ter pelo menos 5 caracteres."),
  price: z.number().min(0, "O preço deve ser maior ou igual a 0."),
  category: z.string().min(1, "Selecione uma categoria."),
  isRecurring: z.boolean().optional(),
  recurringPeriod: z.string().optional(),
  showPublic: z.boolean().optional(),
  showLeadForm: z.boolean().optional(),
}).refine((data) => {
    if (data.isRecurring && !data.recurringPeriod) {
        return false;
    }
    return true;
}, {
    message: "Selecione o período da recorrência.",
    path: ["recurringPeriod"],
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
