"use client";

import { Modal } from "@/components/ui/modal";
import { useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useModal } from "@/contexts/modal-context";
import { useRouter } from "next/navigation";

export function NewLeadModal() {
  const [formData, setFormData] = useState({
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
  });
  const [loading, setLoading] = useState(false);
  const { closeModal } = useModal();
  const router = useRouter();

  async function handleSubmit() {
    setLoading(true);
    const { error } = await supabase.from('clients').insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        cpf_cnpj: formData.cpfCnpj,
        cep: formData.cep,
        address: formData.address,
        number: formData.number,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        status: 'active' // Default status
    }]);

    setLoading(false);
    if (!error) {
        closeModal();
        router.refresh();
    } else {
        alert('Erro ao criar lead');
        console.error(error);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Modal title="Novo Lead">
      <div className="space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar p-1">
        
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LeadInput label="Nome do Cliente" name="name" placeholder="Ex: Ana Costa" value={formData.name} onChange={handleChange} />
            <LeadInput label="Email" name="email" placeholder="cliente@email.com" value={formData.email} onChange={handleChange} />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LeadInput label="Telefone" name="phone" placeholder="(00) 00000-0000" value={formData.phone} onChange={handleChange} />
            <LeadInput label="Empresa" name="company" placeholder="Nome da empresa" value={formData.company} onChange={handleChange} />
        </div>

        {/* CPF/CNPJ */}
        <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2 block">CPF/CNPJ</label>
            <div className="flex gap-2">
                <input 
                    name="cpfCnpj"
                    placeholder="00.000.000/0000-00"
                    value={formData.cpfCnpj}
                    onChange={handleChange}
                    className="flex-1 bg-zinc-950 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-zinc-600"
                />
                <button className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg px-4 border border-white/10 transition-colors">
                    <Search size={18} />
                </button>
            </div>
        </div>

        {/* CEP */}
        <LeadInput label="CEP" name="cep" placeholder="00000-000" value={formData.cep} onChange={handleChange} />

        {/* Address Row 1 */}
        <div className="flex gap-4">
            <div className="flex-1">
                <LeadInput label="Endereço" name="address" placeholder="Rua, Avenida..." value={formData.address} onChange={handleChange} />
            </div>
            <div className="w-24">
                <LeadInput label="Número" name="number" placeholder="Nº" value={formData.number} onChange={handleChange} />
            </div>
        </div>

        {/* Address Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LeadInput label="Bairro" name="neighborhood" placeholder="Bairro" value={formData.neighborhood} onChange={handleChange} />
            <LeadInput label="Cidade" name="city" placeholder="Cidade" value={formData.city} onChange={handleChange} />
            <LeadInput label="Estado" name="state" placeholder="UF" value={formData.state} onChange={handleChange} />
        </div>

        {/* Project Info */}
        <LeadInput label="Projeto" name="project" placeholder="Ex: Logo + Identidade Visual" value={formData.project} onChange={handleChange} />
        
        <LeadInput label="Valor Estimado" name="value" placeholder="4500" value={formData.value} onChange={handleChange} />

        <LeadInput label="Tags" name="tags" placeholder="Branding, Urgente" value={formData.tags} onChange={handleChange} />

        {/* Observations */}
        <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2 block">Observações</label>
            <textarea 
                name="observations"
                placeholder="Notas sobre o lead"
                rows={3}
                value={formData.observations}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-zinc-600 resize-none"
            />
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 mt-6 md:sticky md:bottom-0 bg-zinc-900 pb-2">
             <button onClick={() => closeModal()} className="bg-transparent border border-white/10 text-white hover:bg-white/5 py-3 rounded-xl font-bold transition-colors">
                 Cancelar
             </button>
              <button onClick={handleSubmit} disabled={loading} className="bg-linear-to-r from-primary-500 to-emerald-600 hover:opacity-90 text-black py-3 rounded-xl font-bold shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50">
                  {loading ? 'Salvando...' : 'Criar Lead'}
              </button>
        </div>

      </div>
    </Modal>
  );
}

interface LeadInputProps {
    label: string;
    name: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function LeadInput({ label, name, placeholder, value, onChange }: LeadInputProps) {
    return (
        <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2 block">{label}</label>
            <input 
                name={name}
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-zinc-950 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-zinc-600"
            />
        </div>
    )
}
