import { useEffect, useMemo, useState } from 'react';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { listarAuditoria } from '../../../services/auditoriaApi';
import { listarPainelManutencaoGestor } from '../../../services/gestorManutencaoApi';
import { listarReservas } from '../../../services/reservaApi';
import { listarVeiculos } from '../../../services/veiculoApi';

function pad2(value) {
  return String(value).padStart(2, '0');
}

function countBy(items, resolver) {
  return items.reduce((acc, item) => {
    const key = resolver(item) || 'Nao informado';
    acc.set(key, (acc.get(key) || 0) + 1);
    return acc;
  }, new Map());
}

function mapToRows(map) {
  return [...map.entries()].map(([label, count]) => ({ label, count }));
}

function csvEscape(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(csvEscape).join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function flattenMaintenancePanel(panel) {
  if (!panel) return [];
  return [
    ...(panel.pendentes || []),
    ...(panel.agendadas || []),
    ...(panel.emAndamento || []),
    ...(panel.historico || []),
  ];
}

export function ReportsPage() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    veiculos: [],
    reservas: [],
    manutencoes: [],
    auditoria: [],
  });

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      listarVeiculos({ signal: controller.signal }),
      listarReservas(null, { signal: controller.signal }),
      listarPainelManutencaoGestor({ signal: controller.signal }),
      listarAuditoria({ signal: controller.signal }),
    ])
      .then(([veiculos, reservas, painelManutencao, auditoria]) => {
        setState({
          loading: false,
          error: null,
          veiculos: veiculos || [],
          reservas: reservas || [],
          manutencoes: flattenMaintenancePanel(painelManutencao),
          auditoria: auditoria || [],
        });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({
          loading: false,
          error: error.message || 'Nao foi possivel carregar os relatorios.',
          veiculos: [],
          reservas: [],
          manutencoes: [],
          auditoria: [],
        });
      });

    return () => controller.abort();
  }, []);

  const indicadores = useMemo(() => {
    const veiculosAtivos = state.veiculos.filter((item) => item.status !== 'DESATIVADO').length;
    const reservasPendentes = state.reservas.filter((item) => item.statusReserva === 'SOLICITADA').length;
    const manutencoesAbertas = state.manutencoes.filter((item) =>
      ['PENDENTE', 'AGENDADA', 'EM_ANDAMENTO'].includes(item.status),
    ).length;
    return [
      {
        caption: 'Cadastrados e nao desativados',
        icon: 'fleet',
        title: 'Veiculos ativos',
        value: pad2(veiculosAtivos),
        variant: 'active',
      },
      {
        caption: 'Aguardando decisao do gestor',
        icon: 'reservations',
        title: 'Reservas pendentes',
        value: pad2(reservasPendentes),
        variant: 'maintenance',
      },
      {
        caption: 'Pendentes, agendadas ou em andamento',
        icon: 'maintenance',
        title: 'Manutencoes abertas',
        value: pad2(manutencoesAbertas),
        variant: 'blocked',
      },
      {
        caption: 'Eventos registrados no sistema',
        icon: 'reports',
        title: 'Auditoria',
        value: pad2(state.auditoria.length),
        variant: 'inactive',
      },
    ];
  }, [state.auditoria.length, state.manutencoes, state.reservas, state.veiculos]);

  const veiculosPorStatus = useMemo(
    () => mapToRows(countBy(state.veiculos, (item) => item.status)),
    [state.veiculos],
  );
  const reservasPorStatus = useMemo(
    () => mapToRows(countBy(state.reservas, (item) => item.statusReserva)),
    [state.reservas],
  );
  const manutencoesPorStatus = useMemo(
    () => mapToRows(countBy(state.manutencoes, (item) => item.status)),
    [state.manutencoes],
  );
  const eventosRecentes = useMemo(() => state.auditoria.slice(0, 8), [state.auditoria]);

  function handleExport() {
    downloadCsv('ctrlfleet-relatorio-geral.csv', [
      ['Indicador', 'Valor'],
      ...indicadores.map((item) => [item.title, item.value]),
      [],
      ['Veiculos por status', 'Quantidade'],
      ...veiculosPorStatus.map((item) => [item.label, item.count]),
      [],
      ['Reservas por status', 'Quantidade'],
      ...reservasPorStatus.map((item) => [item.label, item.count]),
      [],
      ['Manutencoes por status', 'Quantidade'],
      ...manutencoesPorStatus.map((item) => [item.label, item.count]),
    ]);
  }

  return (
    <div className="page-stack reports-page">
      <PageHeader
        eyebrow="Gestao de indicadores"
        subtitle="Resumo operacional consolidado de frota, reservas, manutencoes e auditoria."
        title="Relatorios"
      />

      {state.error ? (
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <div>
            <strong>Falha ao carregar relatorios</strong>
            <p>{state.error}</p>
          </div>
        </div>
      ) : null}

      {state.loading ? (
        <SectionCard>
          <div className="admin-dashboard__loading">
            <span className="admin-dashboard__spinner" aria-hidden="true" />
            <p>Consolidando indicadores...</p>
          </div>
        </SectionCard>
      ) : (
        <>
          <div className="admin-dashboard__toolbar-actions">
            <ActionButton icon="document" onClick={handleExport} variant="secondary">
              Exportar CSV
            </ActionButton>
          </div>

          <section className="stats-grid stats-grid--fleet">
            {indicadores.map((stat) => (
              <StatCard key={stat.title} layout="vertical" {...stat} />
            ))}
          </section>

          <section className="content-grid">
            <SectionCard subtitle="Distribuicao atual da frota cadastrada." title="Veiculos por status">
              <div className="table-wrapper">
                <table className="fleet-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {veiculosPorStatus.map((item) => (
                      <tr key={item.label}>
                        <td><StatusBadge label={item.label} /></td>
                        <td>{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard subtitle="Solicitacoes agrupadas por etapa do fluxo." title="Reservas por status">
              <div className="table-wrapper">
                <table className="fleet-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservasPorStatus.map((item) => (
                      <tr key={item.label}>
                        <td><StatusBadge label={item.label} /></td>
                        <td>{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </section>

          <section className="content-grid">
            <SectionCard subtitle="Corretivas e preventivas por situacao." title="Manutencoes por status">
              <div className="table-wrapper">
                <table className="fleet-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manutencoesPorStatus.map((item) => (
                      <tr key={item.label}>
                        <td><StatusBadge label={item.label} /></td>
                        <td>{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard subtitle="Ultimos eventos registrados para rastreabilidade." title="Auditoria recente">
              {eventosRecentes.length === 0 ? (
                <div className="admin-empty">
                  <Icon name="reports" />
                  <p>Nenhum evento de auditoria registrado.</p>
                </div>
              ) : (
                <ol className="reports-timeline">
                  {eventosRecentes.map((event) => (
                    <li className="reports-timeline__item" key={event.id}>
                      <span
                        className={`reports-timeline__dot reports-timeline__dot--${event.severity}`}
                        aria-hidden="true"
                      />
                      <div className="reports-timeline__body">
                        <div className="reports-timeline__head">
                          <strong>{event.action}</strong>
                          <span className="reports-timeline__status">
                            <StatusBadge label={event.status || event.severity} />
                          </span>
                        </div>
                        <p>{event.detail}</p>
                        <small>{event.actor} - {event.date}</small>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </SectionCard>
          </section>
        </>
      )}
    </div>
  );
}
