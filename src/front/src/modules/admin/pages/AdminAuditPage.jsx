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
  const [filtros, setFiltros] = useState({ acao: '', severidade: '', ator: '' });

  function loadAudit(signal, filtrosAtivos = filtros) {
    setAuditData((current) => ({ ...current, loading: true, error: null }));
    return listarAuditoria({ ...filtrosAtivos, signal })
      .then((items) => setAuditData({ loading: false, error: null, items }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setAuditData({
          loading: false,
          error: error.message || 'Falha ao carregar auditoria.',
          items: [],
        });
      });
  }

  useEffect(() => {
    const controller = new AbortController();
    const refreshAudit = () => loadAudit();

    loadAudit(controller.signal);
    window.addEventListener('ctrlfleet:usuarios-updated', refreshAudit);

    return () => {
      controller.abort();
      window.removeEventListener('ctrlfleet:usuarios-updated', refreshAudit);
    };
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
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            placeholder="Filtrar por ação..."
            style={{ flex: 1, minWidth: '150px', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
            value={filtros.acao}
            onChange={(e) => setFiltros((f) => ({ ...f, acao: e.target.value }))}
          />
          <input
            placeholder="Filtrar por ator..."
            style={{ flex: 1, minWidth: '150px', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
            value={filtros.ator}
            onChange={(e) => setFiltros((f) => ({ ...f, ator: e.target.value }))}
          />
          <select
            style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
            value={filtros.severidade}
            onChange={(e) => setFiltros((f) => ({ ...f, severidade: e.target.value }))}
          >
            <option value="">Todas severidades</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <button
            style={{ padding: '0.4rem 1rem', borderRadius: '6px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}
            onClick={() => loadAudit(undefined, filtros)}
            type="button"
          >
            Filtrar
          </button>
          <button
            style={{ padding: '0.4rem 1rem', borderRadius: '6px', background: '#6b7280', color: '#fff', border: 'none', cursor: 'pointer' }}
            onClick={() => {
              const limpos = { acao: '', severidade: '', ator: '' };
              setFiltros(limpos);
              loadAudit(undefined, limpos);
            }}
            type="button"
          >
            Limpar
          </button>
        </div>

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
