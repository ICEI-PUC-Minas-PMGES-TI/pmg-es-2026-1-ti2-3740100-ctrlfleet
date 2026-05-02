import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';

const settingsStats = [
  { caption: 'Parâmetros ativos', icon: 'maintenance', title: 'Regras', value: '12' },
  { caption: 'Dias para expirar convite', icon: 'calendar', title: 'Convites', value: '07' },
  { caption: 'Políticas de senha', icon: 'shield', title: 'Segurança', value: '04' },
  { caption: 'Integrações monitoradas', icon: 'chart', title: 'Integrações', value: '03' },
];

export function AdminSettingsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        subtitle="Ajuste regras globais do painel administrativo e políticas de acesso."
        title="Configurações"
      />

      <section className="stats-grid">
        {settingsStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="content-grid">
        <SectionCard subtitle="Controles usados nos fluxos de criação e revisão." title="Acesso">
          <div className="settings-list">
            <label className="settings-row">
              <div>
                <strong>Aprovação manual de novos usuários</strong>
                <span>Novos cadastros entram como pendentes até validação.</span>
              </div>
              <input defaultChecked type="checkbox" />
            </label>
            <label className="settings-row">
              <div>
                <strong>Bloqueio após tentativas inválidas</strong>
                <span>Impede acesso após 5 tentativas consecutivas.</span>
              </div>
              <input defaultChecked type="checkbox" />
            </label>
            <label className="settings-row">
              <div>
                <strong>Revisão mensal de perfis</strong>
                <span>Gera pendência para conferir permissões sensíveis.</span>
              </div>
              <input type="checkbox" />
            </label>
          </div>
        </SectionCard>

        <SectionCard subtitle="Padrões aplicados em convites e sessões." title="Parâmetros">
          <div className="form-grid settings-form">
            <label className="form-field">
              <span>Validade do convite</span>
              <input defaultValue="7 dias" type="text" />
            </label>
            <label className="form-field">
              <span>Tempo de sessão</span>
              <input defaultValue="8 horas" type="text" />
            </label>
            <label className="form-field">
              <span>Domínio permitido</span>
              <input defaultValue="@ctrlfleet.gov.br" type="text" />
            </label>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
