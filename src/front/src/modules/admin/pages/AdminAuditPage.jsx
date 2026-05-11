import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { listarAuditoria } from '../../../services/auditoriaApi';
import { pad2 } from '../../../services/usuarioMappers';

function severityToStatus(severity) {
  if (severity === 'critical') return 'Bloqueado';
  if (severity === 'warning') return 'Pendente';
  return 'Ativo';
}

export function AdminAuditPage() {
  const [auditData, setAuditData] = useState({
    loading: true,
    error: null,
    items: [],
  });

  useEffect(() => {
    const controller = new AbortController();

    listarAuditoria({ signal: controller.signal })
      .then((items) => setAuditData({ loading: false, error: null, items }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setAuditData({
          loading: false,
          error: error.message || 'Falha ao carregar auditoria.',
          items: [],
        });
      });

    return () => controller.abort();
  }, []);

  const auditStats = useMemo(() => {
    const items = auditData.items;
    const count = (predicate) => items.filter(predicate).length;
    return [
      { caption: 'Eventos registrados', icon: 'reports', title: 'Eventos', value: pad2(items.length) },
      {
        caption: 'Alterações de acesso',
        icon: 'shield',
        title: 'Acessos',
        value: pad2(count((event) => /perfil|acesso|aprov|recus|reativ|bloque/i.test(event.action))),
      },
      {
        caption: 'Ações sobre usuários',
        icon: 'users',
        title: 'Usuários',
        value: pad2(count((event) => /usuario|usuário|convite|senha/i.test(event.action))),
      },
      {
        caption: 'Eventos de atenção',
        icon: 'alert',
        title: 'Alertas',
        value: pad2(count((event) => event.severity === 'warning' || event.severity === 'critical')),
      },
    ];
  }, [auditData.items]);

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
        {auditData.loading ? (
          <div className="admin-dashboard__loading">
            <span className="admin-dashboard__spinner" aria-hidden="true" />
            <p>Carregando eventos...</p>
          </div>
        ) : auditData.error ? (
          <div className="admin-dashboard__error">
            <Icon name="alert" />
            <div>
              <strong>Falha ao carregar auditoria</strong>
              <p>{auditData.error}</p>
            </div>
          </div>
        ) : auditData.items.length === 0 ? (
          <div className="admin-empty">
            <Icon name="reports" />
            <p>Nenhum evento registrado ainda.</p>
          </div>
        ) : (
          <div className="history-list">
            {auditData.items.map((event) => (
              <article className="history-item audit-item" key={event.id}>
                <div>
                  <span>{event.date}</span>
                  <StatusBadge label={event.status || severityToStatus(event.severity)} />
                </div>
                <p>{event.action}</p>
                <small>
                  {event.actor} - {event.detail} Alvo: {event.target}. IP: {event.ip}.
                </small>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
