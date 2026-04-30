import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';

const auditStats = [
  { caption: 'Eventos registrados hoje', icon: 'reports', title: 'Eventos', value: '76' },
  { caption: 'Alterações de permissão', icon: 'shield', title: 'Acessos', value: '09' },
  { caption: 'Logins monitorados', icon: 'users', title: 'Sessões', value: '42' },
  { caption: 'Revisões pendentes', icon: 'alert', title: 'Alertas', value: '03' },
];

const auditEvents = [
  {
    action: 'Perfil alterado',
    actor: 'Ana Costa',
    date: 'Hoje, 10:18',
    detail: 'Permissões de João Duarte atualizadas para Gestor de Frota.',
    status: 'Ativo',
  },
  {
    action: 'Usuário bloqueado',
    actor: 'Sistema',
    date: 'Hoje, 08:06',
    detail: 'Carlos Rocha bloqueado por tentativas inválidas de acesso.',
    status: 'Bloqueado',
  },
  {
    action: 'Convite enviado',
    actor: 'Ana Costa',
    date: 'Ontem, 16:44',
    detail: 'Marina Silva recebeu convite para primeiro acesso.',
    status: 'Pendente',
  },
];

export function AdminAuditPage() {
  return (
    <div className="page-stack">
      <PageHeader
        subtitle="Acompanhe alterações de usuários, permissões e acessos críticos."
        title="Auditoria"
      />

      <section className="stats-grid">
        {auditStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <SectionCard subtitle="Histórico recente de ações administrativas." title="Eventos">
        <div className="history-list">
          {auditEvents.map((event) => (
            <article className="history-item audit-item" key={`${event.date}-${event.action}`}>
              <div>
                <span>{event.date}</span>
                <StatusBadge label={event.status} />
              </div>
              <p>{event.action}</p>
              <small>{event.actor} - {event.detail}</small>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
