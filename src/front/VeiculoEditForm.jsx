
const STATUS_OPCOES = [
  { value: "DISPONIVEL",  label: "Disponível" },
  { value: "EM_USO",      label: "Em uso" },
  { value: "MANUTENCAO",  label: "Em manutenção" },
  { value: "DESATIVADO",  label: "Desativado" },
];

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
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
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
      className={`
        w-full px-3 py-2 text-sm rounded-lg border outline-none
        transition-colors duration-150
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        ${hasError
          ? "border-red-400 bg-red-50"
          : "border-slate-300 bg-white hover:border-slate-400"}
      `}
    />
  );
}

function Select({ hasError, children, ...props }) {
  return (
    <select
      {...props}
      className={`
        w-full px-3 py-2 text-sm rounded-lg border outline-none
        transition-colors duration-150
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        ${hasError
          ? "border-red-400 bg-red-50"
          : "border-slate-300 bg-white hover:border-slate-400"}
      `}
    >
      {children}
    </select>
  );
}

function Secao({ titulo, children }) {
  return (
    <section className="space-y-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
        {titulo}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </section>
  );
}

export default function VeiculoEditForm({
  form,
  errosCampo,
  loading,
  erro,
  sucesso,
  onChange,
  onSubmit,
  onCancelar,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* ── Cabeçalho ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">Editar Veículo</h2>
            {form.placa && (
              <p className="text-xs text-slate-500">
                Placa: <span className="font-mono font-semibold">{form.placa}</span>
              </p>
            )}
          </div>
        </div>

        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            title="Voltar"
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* ── Alertas globais ── */}
      {erro && (
        <div className="mx-6 mt-4 flex items-start gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          Veículo atualizado com sucesso!
        </div>
      )}

      {/* ── Formulário ── */}
      <form onSubmit={onSubmit} className="p-6 space-y-8">

        <Secao titulo="Identificação">
          <Campo label="Placa" erro={errosCampo?.placa} required>
            <Input
              name="placa"
              value={form.placa}
              onChange={onChange}
              maxLength={10}
              placeholder="Ex: ABC1234"
              hasError={!!errosCampo?.placa}
              style={{ textTransform: "uppercase" }}
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
        </Secao>

        <Secao titulo="Situação Operacional">
          <Campo label="Status" erro={errosCampo?.status} required>
            <Select
              name="status"
              value={form.status}
              onChange={onChange}
              hasError={!!errosCampo?.status}
            >
              <option value="">Selecione...</option>
              {STATUS_OPCOES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </Campo>
        </Secao>

        {/* ── Ações ── */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          {onCancelar && (
            <button
              type="button"
              onClick={onCancelar}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium rounded-lg
                         border border-slate-300 text-slate-600
                         hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium rounded-lg
                       bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800
                       disabled:opacity-60 disabled:cursor-not-allowed
                       transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                </svg>
                Salvando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
                Salvar Alterações
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}