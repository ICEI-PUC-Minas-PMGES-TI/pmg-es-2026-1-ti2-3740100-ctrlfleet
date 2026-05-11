import { useState, useCallback } from "react";

const BASE = "http://localhost:8080/api/veiculos";

export function useVeiculoCadastro() {
  const [loading, setLoading]       = useState(false);
  const [erro, setErro]             = useState(null);
  const [errosCampo, setErrosCampo] = useState({});
  const [sucesso, setSucesso]       = useState(false);

  const resetFeedback = () => {
    setErro(null);
    setErrosCampo({});
    setSucesso(false);
  };

  const cadastrar = useCallback(async (payload) => {
    setLoading(true);
    resetFeedback();
    try {
      const res = await fetch(BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        if (body.campos) {
          setErrosCampo(body.campos);
          return null;
        }
        throw new Error(body.erro ?? "Erro ao cadastrar veículo.");
      }
      setSucesso(true);
      return body; 
    } catch (e) {
      setErro(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const limparCampoErro = (campo) =>
    setErrosCampo((prev) => ({ ...prev, [campo]: undefined }));

  return { cadastrar, loading, erro, errosCampo, sucesso, resetFeedback, limparCampoErro };
}
