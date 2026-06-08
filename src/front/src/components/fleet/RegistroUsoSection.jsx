import { useEffect, useState } from 'react';
import { SectionCard } from '../common/SectionCard';
import { listarRegistrosPorVeiculo } from '../../services/registroUsoApi';
import { formatDateTime, formatKm } from '../../utils/registroUsoFormatters';

export function RegistroUsoSection({ veiculoId }) {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!veiculoId) return;

    let cancelado = false;

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
            <div className="registro-uso-resumo__stats">
              <article className="registro-uso-stat">
                <span>KM acumulado</span>
                <strong>
                  {formatKm(
                    registros.reduce((acc, item) => acc + (Number(item.quilometragemPercorrida) || 0), 0),
                  )}
                </strong>
              </article>
              <article className="registro-uso-stat">
                <span>Retornos finalizados</span>
                <strong>{registros.filter((item) => item.dataRetorno).length}</strong>
              </article>
              <article className="registro-uso-stat">
                <span>Última saída</span>
                <strong>
                  {formatDateTime(
                    registros.reduce((latest, item) => {
                      if (!item?.dataSaida) return latest;
                      if (!latest) return item.dataSaida;
                      return new Date(item.dataSaida) > new Date(latest) ? item.dataSaida : latest;
                    }, null),
                  )}
                </strong>
              </article>
            </div>
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
                  const kmRodados = reg.quilometragemPercorrida;
                  const motorista = reg.nomeMotorista || 'Não informado';

                  return (
                    <tr key={reg.id}>
                      <td className="registro-uso-datetime">{formatDateTime(reg.dataSaida)}</td>
                      <td className="registro-uso-datetime">{formatDateTime(reg.dataRetorno)}</td>
                      <td>{formatKm(reg.quilometragemSaida)}</td>
                      <td>{formatKm(reg.quilometragemRetorno)}</td>
                      <td>
                        <span className="registro-uso-km-badge">
                          {kmRodados != null ? formatKm(kmRodados) : '—'}
                        </span>
                      </td>
                      <td>
                        <span className="registro-uso-motorista">
                          <span className="registro-uso-motorista__avatar">{motorista.charAt(0).toUpperCase()}</span>
                          <span>{motorista}</span>
                        </span>
                      </td>
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
              const kmRodados = reg.quilometragemPercorrida;

              return (
                <article className="registro-uso-card" key={reg.id}>
                  <div className="registro-uso-card__header">
                    <div className="registro-uso-card__trip">
                      <strong>Saída: {formatDateTime(reg.dataSaida)}</strong>
                      <span>Registro #{reg.id}</span>
                    </div>
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
