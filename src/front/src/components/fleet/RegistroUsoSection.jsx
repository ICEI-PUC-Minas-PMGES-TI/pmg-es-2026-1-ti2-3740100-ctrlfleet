import { useEffect, useState } from 'react';
import { SectionCard } from '../common/SectionCard';
import { listarRegistrosPorVeiculo } from '../../services/registroUsoApi';

function formatDateTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatKm(value) {
  if (value == null) return '—';
  return Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }) + ' km';
}

export function RegistroUsoSection({ veiculoId }) {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!veiculoId) return;

    let cancelado = false;
    setLoading(true);
    setErro(null);

    listarRegistrosPorVeiculo(veiculoId)
      .then((data) => {
        if (!cancelado) setRegistros(data);
      })
      .catch((err) => {
        if (!cancelado) setErro(err.message);
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [veiculoId]);

  return (
    <SectionCard
      subtitle="Histórico completo de utilização do veículo."
      title="Registros de Uso"
    >
      {loading && (
        <div className="registro-uso-loading">
          <div className="registro-uso-skeleton" />
          <div className="registro-uso-skeleton" />
          <div className="registro-uso-skeleton" />
        </div>
      )}

      {erro && (
        <div className="registro-uso-erro">
          <p>{erro}</p>
        </div>
      )}

      {!loading && !erro && registros.length === 0 && (
        <div className="registro-uso-vazio">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <p>Nenhum registro de uso encontrado para este veículo.</p>
        </div>
      )}

      {!loading && !erro && registros.length > 0 && (
        <>
          <div className="registro-uso-resumo">
            <span>{registros.length} registro{registros.length !== 1 ? 's' : ''} encontrado{registros.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Desktop: tabela */}
          <div className="registro-uso-table-wrapper">
            <table className="registro-uso-table">
              <thead>
                <tr>
                  <th>Saída</th>
                  <th>Retorno</th>
                  <th>KM Saída</th>
                  <th>KM Retorno</th>
                  <th>KM Rodados</th>
                  <th>Motorista</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((reg) => {
                  const kmRodados =
                    reg.quilometragemRetorno != null && reg.quilometragemSaida != null
                      ? reg.quilometragemRetorno - reg.quilometragemSaida
                      : null;

                  return (
                    <tr key={reg.id}>
                      <td>{formatDateTime(reg.dataSaida)}</td>
                      <td>{formatDateTime(reg.dataRetorno)}</td>
                      <td>{formatKm(reg.quilometragemSaida)}</td>
                      <td>{formatKm(reg.quilometragemRetorno)}</td>
                      <td>
                        <span className="registro-uso-km-badge">
                          {kmRodados != null ? formatKm(kmRodados) : '—'}
                        </span>
                      </td>
                      <td>{reg.nomeMotorista || '—'}</td>
                      <td className="registro-uso-obs">
                        {reg.observacoesVeiculo || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <div className="registro-uso-card-list">
            {registros.map((reg) => {
              const kmRodados =
                reg.quilometragemRetorno != null && reg.quilometragemSaida != null
                  ? reg.quilometragemRetorno - reg.quilometragemSaida
                  : null;

              return (
                <article className="registro-uso-card" key={reg.id}>
                  <div className="registro-uso-card__header">
                    <strong>{formatDateTime(reg.dataSaida)}</strong>
                    <span className="registro-uso-km-badge">
                      {kmRodados != null ? formatKm(kmRodados) : '—'}
                    </span>
                  </div>
                  <dl className="registro-uso-card__meta">
                    <div>
                      <dt>Retorno</dt>
                      <dd>{formatDateTime(reg.dataRetorno)}</dd>
                    </div>
                    <div>
                      <dt>KM Saída</dt>
                      <dd>{formatKm(reg.quilometragemSaida)}</dd>
                    </div>
                    <div>
                      <dt>KM Retorno</dt>
                      <dd>{formatKm(reg.quilometragemRetorno)}</dd>
                    </div>
                    <div>
                      <dt>Motorista</dt>
                      <dd>{reg.nomeMotorista || '—'}</dd>
                    </div>
                    {reg.observacoesVeiculo && (
                      <div className="registro-uso-card__obs">
                        <dt>Observações</dt>
                        <dd>{reg.observacoesVeiculo}</dd>
                      </div>
                    )}
                  </dl>
                </article>
              );
            })}
          </div>
        </>
      )}
    </SectionCard>
  );
}
