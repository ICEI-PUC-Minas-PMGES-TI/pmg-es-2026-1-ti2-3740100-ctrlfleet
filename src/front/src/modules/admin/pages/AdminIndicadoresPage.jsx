import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { obterTodosIndicadores } from '../../../services/adminIndicadoresApi';

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function defaultRange() {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  return { inicio: toDateString(inicio), fim: toDateString(hoje) };
}

function formatDateBR(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function diffDays(a, b) {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db - da) / 86400000) + 1;
}

function pct(value) {
  return `${Math.round(value || 0)}%`;
}

function KpiCard({ icon, name, value, met, metaLabel, track, detail, note }) {
  return (
    <article className={`ind-kpi-card${met ? ' ind-kpi-card--met' : ' ind-kpi-card--miss'}`}>
      <div className="ind-kpi-card__icon">
        <Icon name={icon} />
      </div>
      <div className="ind-kpi-card__body">
        <h3 className="ind-kpi-card__name">{name}</h3>
        <div className="ind-kpi-card__headline">
          <span className="ind-kpi-card__pct">{pct(value)}</span>
          <StatusBadge label={met ? 'Meta atingida' : 'Abaixo da meta'} />
        </div>
        <div className="ind-kpi-card__track">
          <div
            className={`ind-kpi-card__fill${met ? ' ind-kpi-card__fill--success' : ' ind-kpi-card__fill--danger'}`}
            style={{ width: `${Math.min(value || 0, 100)}%` }}
          />
          {track != null && (
            <span className="ind-kpi-card__goal-marker" style={{ left: `${track}%` }} title={metaLabel} />
          )}
        </div>
        <dl className="ind-kpi-card__stats">
          {detail.map((d) => (
            <div key={d.label}>
              <dt>{d.label}</dt>
              <dd>{d.value}</dd>
            </div>
          ))}
        </dl>
        {note && <p className="ind-kpi-card__note">{note}</p>}
      </div>
    </article>
  );
}

function ProcessSection({ number, title, subtitle, periodNote, children }) {
  return (
    <SectionCard
      subtitle={subtitle}
      title={
        <span className="ind-process-title">
          <span className="ind-process-badge">{number}</span>
          {title}
          {periodNote && <span className="ind-process-period-note">{periodNote}</span>}
        </span>
      }
    >
      <div className="ind-kpi-grid">{children}</div>
    </SectionCard>
  );
}

export function AdminIndicadoresPage() {
  const def = useMemo(defaultRange, []);
  const today = useMemo(() => toDateString(new Date()), []);

  const [inicio, setInicio] = useState(def.inicio);
  const [fim, setFim] = useState(def.fim);
  const [pendingInicio, setPendingInicio] = useState(def.inicio);
  const [pendingFim, setPendingFim] = useState(def.fim);

  const [data, setData] = useState({ loading: true, error: null, ind: null });

  useEffect(() => {
    const controller = new AbortController();
    setData((c) => ({ ...c, loading: true, error: null }));
    obterTodosIndicadores({ signal: controller.signal, inicio, fim })
      .then((ind) => setData({ loading: false, error: null, ind }))
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setData({ loading: false, error: err.message || 'Falha ao carregar indicadores.', ind: null });
      });
    return () => controller.abort();
  }, [inicio, fim]);

  function applyRange() {
    if (pendingInicio && pendingFim && pendingInicio <= pendingFim) {
      setInicio(pendingInicio);
      setFim(pendingFim);
    }
  }

  const days = inicio && fim ? diffDays(inicio, fim) : 0;
  const ind = data.ind;

  return (
    <div className="page-stack admin-indicadores">
      <PageHeader
        eyebrow="Painel administrativo"
        subtitle="Indicadores de desempenho dos 4 processos do CtrlFleet."
        title="Indicadores"
      />

      {/* Date range picker */}
      <div className="ind-daterange-bar">
        <div className="ind-daterange-bar__label">
          <Icon name="calendar" />
          <span>Período de análise</span>
        </div>

        <div className="ind-daterange-picker">
          <div className="ind-daterange-field">
            <label className="ind-daterange-field__label" htmlFor="ind-date-from">
              De
            </label>
            <input
              className="ind-daterange-field__input"
              id="ind-date-from"
              max={pendingFim || today}
              onChange={(e) => setPendingInicio(e.target.value)}
              type="date"
              value={pendingInicio}
            />
          </div>

          <div className="ind-daterange-sep" aria-hidden="true">
            <Icon name="chevronRight" />
          </div>

          <div className="ind-daterange-field">
            <label className="ind-daterange-field__label" htmlFor="ind-date-to">
              Até
            </label>
            <input
              className="ind-daterange-field__input"
              id="ind-date-to"
              max={today}
              min={pendingInicio}
              onChange={(e) => setPendingFim(e.target.value)}
              type="date"
              value={pendingFim}
            />
          </div>

          <button
            className="ind-daterange-apply"
            disabled={!pendingInicio || !pendingFim || pendingInicio > pendingFim}
            onClick={applyRange}
            type="button"
          >
            Aplicar
          </button>
        </div>

        <div className="ind-daterange-bar__meta">
          <span className="ind-daterange-bar__range">
            {formatDateBR(inicio)} — {formatDateBR(fim)}
          </span>
          {days > 0 && (
            <span className="ind-daterange-bar__days">{days} dia{days !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {data.loading && (
        <div className="admin-dashboard__loading">
          <span className="admin-dashboard__spinner" aria-hidden="true" />
          <p>Carregando indicadores...</p>
        </div>
      )}

      {data.error && (
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <div>
            <strong>Falha ao carregar</strong>
            <p>{data.error}</p>
          </div>
        </div>
      )}

      {ind && (
        <>
          {/* Processo 1 — Gestão de frotas */}
          <ProcessSection
            number="1"
            subtitle="Disponibilidade e regularidade documental dos veículos cadastrados."
            title="Gestão de frotas"
            periodNote="Estado atual"
          >
            <KpiCard
              icon="fleet"
              name="Taxa de disponibilidade operacional da frota"
              value={ind.taxaDisponibilidadeOperacional}
              met={ind.taxaDisponibilidadeOperacional >= 70}
              metaLabel="Meta: 70%"
              track={70}
              detail={[
                { label: 'Disponíveis', value: ind.veiculosDisponiveis },
                { label: 'Ativos (total)', value: ind.veiculosTotaisAtivos },
                { label: 'Meta', value: '≥ 70%' },
              ]}
            />
            <KpiCard
              icon="document"
              name="Índice de regularidade documental"
              value={ind.indiceRegularidadeDocumental}
              met={ind.indiceRegularidadeDocumental >= 95}
              metaLabel="Meta: 95%"
              track={95}
              detail={[
                { label: 'Vigentes', value: ind.documentosVigentes },
                { label: 'Total docs', value: ind.totalDocumentos },
                { label: 'Meta', value: '≥ 95%' },
              ]}
              note={ind.totalDocumentos === 0 ? 'Nenhum documento cadastrado.' : null}
            />
          </ProcessSection>

          {/* Processo 2 — Gestão de pessoas */}
          <ProcessSection
            number="2"
            subtitle="Aptidão dos motoristas e regularidade das contas de acesso."
            title="Gestão de pessoas"
            periodNote="Estado atual"
          >
            <KpiCard
              icon="steering"
              name="Taxa de motoristas aptos para condução"
              value={ind.taxaMotoristasAptos}
              met={ind.taxaMotoristasAptos >= 90}
              metaLabel="Meta: 90%"
              track={90}
              detail={[
                { label: 'Aptos', value: ind.motoristasAptos },
                { label: 'Total motoristas', value: ind.totalMotoristas },
                { label: 'Meta', value: '≥ 90%' },
              ]}
              note={ind.totalMotoristas === 0 ? 'Nenhum motorista cadastrado.' : null}
            />
            <KpiCard
              icon="users"
              name="Taxa de contas de acesso regularizadas"
              value={ind.taxaContasRegularizadas}
              met={ind.taxaContasRegularizadas >= 85}
              metaLabel="Meta: 85%"
              track={85}
              detail={[
                { label: 'Ativos', value: ind.usuariosAtivos },
                { label: 'Não inativos', value: ind.usuariosNaoInativos },
                { label: 'Meta', value: '≥ 85%' },
              ]}
            />
          </ProcessSection>

          {/* Processo 3 — Gestão de manutenção */}
          <ProcessSection
            number="3"
            subtitle="Conclusão de ordens e aderência preventiva no período selecionado."
            title="Gestão de manutenção"
            periodNote={`${formatDateBR(inicio)} — ${formatDateBR(fim)}`}
          >
            <KpiCard
              icon="maintenance"
              name="Taxa de conclusão de ordens de manutenção"
              value={ind.taxaConclusaoManutencoes}
              met={ind.taxaConclusaoManutencoes >= 80}
              metaLabel="Meta: 80%"
              track={80}
              detail={[
                { label: 'Concluídas', value: ind.manutencoesConcluidas },
                { label: 'Abertas', value: ind.manutencoesAbertas },
                { label: 'Meta', value: '≥ 80%' },
              ]}
              note={ind.manutencoesAbertas === 0 ? 'Nenhuma ordem aberta no período.' : null}
            />
            <KpiCard
              icon="preventive"
              name="Índice de aderência à manutenção preventiva"
              value={ind.indiceAderenciaPreventiva}
              met={ind.indiceAderenciaPreventiva >= 75}
              metaLabel="Meta: 75%"
              track={75}
              detail={[
                { label: 'Sem crítica', value: ind.veiculosSemPreventivaCritica },
                { label: 'Veículos ativos', value: ind.veiculosAtivosManutencao },
                { label: 'Meta', value: '≥ 75%' },
              ]}
            />
          </ProcessSection>

          {/* Processo 4 — Gestão de reservas */}
          <ProcessSection
            number="4"
            subtitle="Aprovação de solicitações e conclusão de viagens no período selecionado."
            title="Gestão de reservas"
            periodNote={`${formatDateBR(inicio)} — ${formatDateBR(fim)}`}
          >
            <KpiCard
              icon="reservations"
              name="Taxa de aprovação de solicitações de reserva"
              value={ind.taxaAprovacaoReservas}
              met={ind.taxaAprovacaoReservas >= 85}
              metaLabel="Meta: 85%"
              track={85}
              detail={[
                { label: 'Aprovadas', value: ind.reservasAprovadas },
                { label: 'Analisadas', value: ind.reservasAnalisadas },
                { label: 'Meta', value: '≥ 85%' },
              ]}
              note={ind.reservasAnalisadas === 0 ? 'Nenhuma reserva analisada no período.' : null}
            />
            <KpiCard
              icon="fleet"
              name="Taxa de conclusão de viagens reservadas"
              value={ind.taxaConclusaoViagens}
              met={ind.taxaConclusaoViagens >= 70}
              metaLabel="Meta: 70%"
              track={70}
              detail={[
                { label: 'Concluídas', value: ind.reservasConcluidas },
                { label: 'Elegíveis', value: ind.reservasElegiveisParaConclusao },
                { label: 'Meta', value: '≥ 70%' },
              ]}
              note={ind.reservasElegiveisParaConclusao === 0 ? 'Nenhuma reserva elegível no período.' : null}
            />
          </ProcessSection>
        </>
      )}
    </div>
  );
}
