import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';

const requesterReservations = [
  {
    datahoraFimEstimada: '18/05/2026 12:00',
    datahoraInicioPrevisto: '18/05/2026 08:00',
    datahoraSolicitacao: '16/05/2026 14:42',
    destino: 'Secretaria de Saúde',
    idReserva: 'RES-001',
    idUsuario: 'USR-014',
    idVeiculo: 'VEI-001',
    origem: 'Prefeitura Municipal',
    statusReserva: 'Aprovada',
    veiculo: 'RBC-4E21 - Toyota Hilux SW4',
  },
  {
    datahoraFimEstimada: '20/05/2026 17:00',
    datahoraInicioPrevisto: '20/05/2026 14:00',
    datahoraSolicitacao: '17/05/2026 09:10',
    destino: 'Almoxarifado Central',
    idReserva: 'RES-002',
    idUsuario: 'USR-014',
    idVeiculo: 'VEI-004',
    origem: 'Secretaria de Administração',
    statusReserva: 'Pendente',
    veiculo: 'MTA-9011 - Mercedes Sprinter',
  },
  {
    datahoraFimEstimada: '15/05/2026 11:30',
    datahoraInicioPrevisto: '15/05/2026 09:00',
    datahoraSolicitacao: '13/05/2026 16:05',
    destino: 'Escola Municipal Primavera',
    idReserva: 'RES-003',
    idUsuario: 'USR-014',
    idVeiculo: 'VEI-005',
    origem: 'Secretaria de Educação',
    statusReserva: 'Concluída',
    veiculo: 'RVA-3021 - Renault Oroch',
  },
];

export function RequesterReservationsPage() {
  const location = useLocation();

  const summaryCards = useMemo(() => {
    const count = (status) => requesterReservations.filter((reservation) => reservation.statusReserva === status).length;

    return [
      {
        caption: 'solicitações registradas',
        icon: 'reservations',
        title: 'Total',
        value: String(requesterReservations.length).padStart(2, '0'),
      },
      {
        caption: 'aguardando análise',
        icon: 'calendar',
        title: 'Pendentes',
        value: String(count('Pendente')).padStart(2, '0'),
      },
      {
        caption: 'liberadas para uso',
        icon: 'check',
        title: 'Aprovadas',
        value: String(count('Aprovada')).padStart(2, '0'),
      },
      {
        caption: 'histórico do solicitante',
        icon: 'clipboard',
        title: 'Concluídas',
        value: String(count('Concluída')).padStart(2, '0'),
      },
    ];
  }, []);

  return (
    <div className="page-stack">
      <PageHeader
        actionIcon="plus"
        actionLabel="Nova reserva"
        actionTo="/solicitante/reservas/nova"
        eyebrow="Área do solicitante"
        subtitle="Acompanhe o status das reservas solicitadas neste perfil."
        title="Minhas Reservas"
      />

      {location.state?.flashMessage ? <div className="flash-banner">{location.state.flashMessage}</div> : null}

      <section className="stats-grid">
        {summaryCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <SectionCard subtitle="Histórico e acompanhamento das solicitações feitas neste perfil." title="Reservas solicitadas">
        <div className="table-summary">
          <span>Mostrando {requesterReservations.length} reservas</span>
          <span>Dados demonstrativos mantidos apenas no front-end.</span>
        </div>

        <div className="table-wrapper">
          <table className="fleet-table">
            <thead>
              <tr>
                <th>Destino</th>
                <th>Veículo</th>
                <th>Origem</th>
                <th>Retirada</th>
                <th>Devolução</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requesterReservations.map((reservation) => (
                <tr key={reservation.idReserva}>
                  <td>
                    <strong>{reservation.destino}</strong>
                    <p className="reservation-table__purpose">Solicitada em {reservation.datahoraSolicitacao}</p>
                  </td>
                  <td>{reservation.veiculo}</td>
                  <td>{reservation.origem}</td>
                  <td>{reservation.datahoraInicioPrevisto}</td>
                  <td>{reservation.datahoraFimEstimada}</td>
                  <td>
                    <StatusBadge label={reservation.statusReserva} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="reservation-card-list">
          {requesterReservations.map((reservation) => (
            <article className="reservation-card" key={reservation.idReserva}>
              <div className="reservation-card__header">
                <div>
                  <strong>{reservation.destino}</strong>
                  <span>{reservation.veiculo}</span>
                </div>
                <StatusBadge label={reservation.statusReserva} />
              </div>
              <dl className="reservation-card__meta">
                <div>
                  <dt>Origem</dt>
                  <dd>{reservation.origem}</dd>
                </div>
                <div>
                  <dt>Retirada</dt>
                  <dd>{reservation.datahoraInicioPrevisto}</dd>
                </div>
                <div>
                  <dt>Devolução</dt>
                  <dd>{reservation.datahoraFimEstimada}</dd>
                </div>
                <div className="reservation-card__purpose">
                  <dt>Solicitação</dt>
                  <dd>{reservation.datahoraSolicitacao}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
