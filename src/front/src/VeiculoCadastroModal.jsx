function Campo({ label, erro, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-600">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {erro && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {erro}
        </p>
      )}
    </div>
  );
}

function Input({ hasError, ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 text-sm rounded-lg border outline-none
        transition-colors duration-150
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        ${hasError
          ? "border-red-400 bg-red-50"
          : "border-slate-300 bg-white hover:border-slate-400"
        }`}
    />
  );
}

export default function VeiculoCadastroModal({
  aberto,
  form,
  errosCampo,
  erro,
  sucesso,
  loading,
  onChange,
  onSubmit,
  onFechar,
}) {
  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}
    >
      {/* Painel do modal */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-slate-800">Cadastrar Veículo</h2>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            title="Fechar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Alerta de erro global */}
        {erro && (
          <div className="mx-6 mt-4 flex items-start gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {erro}
          </div>
        )}

        {/* Alerta de sucesso */}
        {sucesso && (
          <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Veículo cadastrado com sucesso!
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Campo label="Placa" erro={errosCampo?.placa} required>
              <Input
                name="placa"
                value={form.placa}
                onChange={onChange}
                maxLength={8}
                placeholder="ABC1234 ou ABC1D23"
                hasError={!!errosCampo?.placa}
                style={{ textTransform: "uppercase" }}
              />
            </Campo>

            <Campo label="Ano" erro={errosCampo?.ano} required>
              <Input
                type="number"
                name="ano"
                value={form.ano}
                onChange={onChange}
                min={1990}
                max={2100}
                placeholder="Ex: 2021"
                hasError={!!errosCampo?.ano}
              />
            </Campo>

            <Campo label="Marca" erro={errosCampo?.marca} required>
              <Input
                name="marca"
                value={form.marca}
                onChange={onChange}
                placeholder="Ex: Volkswagen"
                hasError={!!errosCampo?.marca}
              />
            </Campo>

            <Campo label="Modelo" erro={errosCampo?.modelo} required>
              <Input
                name="modelo"
                value={form.modelo}
                onChange={onChange}
                placeholder="Ex: Gol 1.6"
                hasError={!!errosCampo?.modelo}
              />
            </Campo>

          </div>

          <p className="text-xs text-slate-400">
            O status inicial será <span className="font-semibold text-slate-500">Disponível</span> automaticamente.
          </p>

          {/* Ações */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onFechar}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium rounded-lg
                         border border-slate-300 text-slate-600
                         hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium rounded-lg
                         bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition-colors flex items-center justify-center gap-2 ml-auto"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Cadastrando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Cadastrar
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
