
import { useState, useEffect, useCallback } from "react";
import { useVeiculoCadastro } from "../hooks/useVeiculoCadastro";
import VeiculoCadastroModal from "../../../components/gestor/VeiculoCadastroModal";

const FORM_VAZIO = { placa: "", modelo: "", marca: "", ano: "" };

const STATUS_LABEL = {
  DISPONIVEL: { label: "Disponível",    classe: "bg-green-100 text-green-700" },
  EM_USO:     { label: "Em uso",        classe: "bg-blue-100 text-blue-700"   },
  MANUTENCAO: { label: "Em manutenção", classe: "bg-yellow-100 text-yellow-700" },
  DESATIVADO: { label: "Desativado",    classe: "bg-slate-100 text-slate-500"  },
};

export default function FrotaPage() {
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm]               = useState(FORM_VAZIO);
  const [veiculos, setVeiculos]       = useState([]);
  const [carregando, setCarregando]   = useState(true);

  const { cadastrar, loading, erro, errosCampo, sucesso, resetFeedback, limparCampoErro } =
    useVeiculoCadastro();

  const buscarVeiculos = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch("http://localhost:8080/api/veiculos");
      if (res.ok) setVeiculos(await res.json());
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { buscarVeiculos(); }, [buscarVeiculos]);

  const handleAbrirModal = () => {
    resetFeedback();
    setForm(FORM_VAZIO);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    resetFeedback();
    setForm(FORM_VAZIO);
  };

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
    const novo = await cadastrar(payload);
    if (novo) {
      setVeiculos((prev) => [...prev, novo]); // atualiza lista sem novo fetch
      setTimeout(handleFecharModal, 1200);    // fecha após exibir sucesso
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* Cabeçalho da página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Gestão de Frota</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {veiculos.length} veículo{veiculos.length !== 1 ? "s" : ""} cadastrado{veiculos.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={handleAbrirModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white
                     text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Veículo
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {carregando ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-lg" />
            ))}
          </div>
        ) : veiculos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0M13 6H5l-2 6h16l-2-6h-4z" />
            </svg>
            <p className="text-sm font-medium">Nenhum veículo cadastrado</p>
            <p className="text-xs mt-1">Clique em "Novo Veículo" para começar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Placa</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Veículo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ano</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {veiculos.map((v) => {
                  const s = STATUS_LABEL[v.status] ?? { label: v.status, classe: "bg-slate-100 text-slate-500" };
                  return (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-slate-700">{v.placa}</td>
                      <td className="px-4 py-3 text-slate-600">{v.marca} {v.modelo}</td>
                      <td className="px-4 py-3 text-slate-500">{v.ano}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${s.classe}`}>
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de cadastro */}
      <VeiculoCadastroModal
        aberto={modalAberto}
        form={form}
        errosCampo={errosCampo}
        erro={erro}
        sucesso={sucesso}
        loading={loading}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onFechar={handleFecharModal}
      />
    </div>
  );
}
