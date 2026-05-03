
import { useEffect, useState } from "react";
import { useVeiculoEdit } from "../hooks/useVeiculoEdit";
import VeiculoEditForm from "../../../components/gestor/VeiculoEditForm";

const FORM_VAZIO = {
  placa:  "",
  modelo: "",
  marca:  "",
  ano:    "",
  status: "",
};

export default function EditarVeiculoPage({ veiculoId, onSucesso, onCancelar }) {
  const { buscar, salvar, loading, erro, errosCampo, sucesso, limparCampoErro } = useVeiculoEdit();
  const [form, setForm]           = useState(FORM_VAZIO);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!veiculoId) return;
    (async () => {
      setCarregando(true);
      const dados = await buscar(veiculoId);
      if (dados) {
        setForm({
          placa:  dados.placa  ?? "",
          modelo: dados.modelo ?? "",
          marca:  dados.marca  ?? "",
          ano:    dados.ano    ?? "",
          status: dados.status ?? "",
        });
      }
      setCarregando(false);
    })();
  }, [veiculoId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    limparCampoErro(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      placa: form.placa.toUpperCase().trim(),
      ano:   form.ano !== "" ? Number(form.ano) : null,
    };
    const atualizado = await salvar(veiculoId, payload);
    if (atualizado && onSucesso) onSucesso(atualizado);
  };

  if (carregando) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-4 animate-pulse">
        <div className="h-8 bg-slate-100 rounded-lg w-1/3" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-slate-100 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <VeiculoEditForm
      form={form}
      errosCampo={errosCampo}
      loading={loading}
      erro={erro}
      sucesso={sucesso}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancelar={onCancelar}
    />
  );
}