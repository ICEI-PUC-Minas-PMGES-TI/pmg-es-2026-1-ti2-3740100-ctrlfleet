import { Link } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { DeveloperAvatar } from '../../../components/public/DeveloperAvatar';
import { FleetSceneAnimation } from '../../../components/public/FleetSceneAnimation';
import { PublicThemeToggle } from '../../../components/public/PublicThemeToggle';
import { ScrollReveal } from '../../../components/public/ScrollReveal';
import { usePublicTheme } from '../../../hooks/usePublicTheme';

const REPO_BASE =
  'https://github.com/ICEI-PUC-Minas-PMGES-TI/pmg-es-2026-1-ti2-3740100-ctrlfleet';
const REPO_DOCS_URL = `${REPO_BASE}/tree/main/docs`;

const NAV_LINKS = [
  { href: '#sobre', label: 'Sobre' },
  { href: '#indicadores', label: 'Indicadores' },
  { href: '#fluxo', label: 'Como funciona' },
  { href: '#recursos', label: 'Módulos' },
  { href: '#perfis', label: 'Perfis' },
  { href: '#equipe', label: 'Equipe' },
];

const HERO_POINTS = [
  'Reservas com aprovação do gestor e rastreio de uso por motorista',
  'Checklist de saída e retorno vinculado à quilometragem do veículo',
  'Auditoria de decisões críticas para conformidade no setor público',
];

const METRICS = [
  { label: 'Veículos cadastrados', value: '48', hint: 'Frota municipal monitorada' },
  { label: 'Reservas no mês', value: '126', hint: 'Solicitações processadas' },
  { label: 'Taxa de utilização', value: '87%', hint: 'Média da frota ativa' },
  { label: 'Manutenções em dia', value: '96%', hint: 'Conformidade preventiva' },
];

const WORKFLOW = [
  {
    step: '01',
    icon: 'reservations',
    title: 'Solicitação',
    text: 'O solicitante informa origem, destino, horário e justificativa. O sistema valida disponibilidade do veículo.',
  },
  {
    step: '02',
    icon: 'check',
    title: 'Aprovação',
    text: 'O gestor de frota analisa a demanda, aprova ou reprova com motivo registrado na auditoria.',
  },
  {
    step: '03',
    icon: 'fleet',
    title: 'Checklist e saída',
    text: 'O motorista registra o checklist de saída e inicia a corrida. O veículo passa ao status em uso.',
  },
  {
    step: '04',
    icon: 'history',
    title: 'Retorno e encerramento',
    text: 'Ao finalizar, o checklist de retorno e a quilometragem encerram o registro de uso da reserva.',
  },
];

const FEATURES = [
  {
    icon: 'fleet',
    title: 'Gestão de frota',
    text: 'Cadastro de veículos com placa, tipo, documentação, status e histórico completo de utilização.',
  },
  {
    icon: 'reservations',
    title: 'Reservas',
    text: 'Solicitações com mapa de trajeto, janela de horários e acompanhamento do ciclo até a conclusão.',
  },
  {
    icon: 'maintenance',
    title: 'Manutenção',
    text: 'Registro de serviços preventivos e corretivos com custo, quilometragem e fornecedor.',
  },
  {
    icon: 'chart',
    title: 'Indicadores',
    text: 'Painéis com métricas de disponibilidade, uso por setor e evolução da frota ao longo do tempo.',
  },
  {
    icon: 'users',
    title: 'Usuários e perfis',
    text: 'Controle de acesso por papel: administrador, gestor, motorista e solicitante.',
  },
  {
    icon: 'history',
    title: 'Auditoria',
    text: 'Log de aprovações, reprovações, início e fim de trajetos para prestação de contas.',
  },
];

const PROFILES = [
  {
    icon: 'users',
    role: 'Administrador',
    desc: 'Gerencia usuários, parâmetros do sistema e visão global da operação.',
    access: ['Usuários', 'Configurações', 'Auditoria completa'],
  },
  {
    icon: 'fleet',
    role: 'Gestor de frota',
    desc: 'Aprova reservas, acompanha veículos, manutenções e indicadores da frota.',
    access: ['Frota', 'Reservas', 'Manutenção', 'Relatórios'],
  },
  {
    icon: 'reservations',
    role: 'Motorista',
    desc: 'Executa checklists, inicia e finaliza trajetos das reservas atribuídas.',
    access: ['Minhas reservas', 'Checklist saída/retorno', 'Histórico'],
  },
  {
    icon: 'clipboard',
    role: 'Solicitante',
    desc: 'Solicita veículos para demandas de serviço com origem, destino e justificativa.',
    access: ['Nova reserva', 'Minhas solicitações', 'Cancelamento'],
  },
];

const DEVELOPERS = [
  { slug: 'alexia', name: 'Alexia Fernanda Alves de Andrade' },
  { slug: 'guilherme', name: 'Guilherme Augusto Martins de Carvalho' },
  { slug: 'italo', name: 'Ítalo Eduardo Carneiro da Silva' },
  { slug: 'joao', name: 'João Victor Vial Leite Soares' },
  { slug: 'lucas', name: 'Lucas Maia Marques Pinheiro' },
  { slug: 'rafael', name: 'Rafael Galileu Thales Oliveira' },
];

const BENEFITS = [
  'Reduz conflitos de agenda entre setores ao centralizar reservas',
  'Evita saídas sem checklist ou sem registro de quilometragem',
  'Facilita auditorias com trilha de quem aprovou, usou e devolveu o veículo',
  'Integra manutenção e uso para decisões baseadas em dados reais da frota',
];

export function HomePage() {
  const { theme, toggleTheme } = usePublicTheme();

  return (
    <main className="pub-page" data-pub-theme={theme}>
      <header className="pub-nav-bar">
        <div className="pub-nav-bar__inner">
          <nav className="pub-nav" aria-label="Navegação principal">
            <Link className="pub-nav__brand" to="/">
              <img alt="" src="/ctrlfleet-logo-icon.png" />
              <span className="pub-nav__brand-text">
                <strong>CtrlFleet</strong>
                <small>Gestão de frotas</small>
              </span>
            </Link>

            <div className="pub-nav__menu" role="menubar">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} role="menuitem">
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pub-nav__actions">
              <PublicThemeToggle onToggle={toggleTheme} theme={theme} />
              <ActionButton className="pub-nav__cta" icon="logout" to="/login">
                Entrar no sistema
              </ActionButton>
            </div>
          </nav>
        </div>
      </header>

      <div className="pub-page__inner">
        <section className="pub-hero" aria-label="Apresentação CtrlFleet">
          <div className="pub-hero__copy">
            <div className="pub-hero__badge">
              <span className="pub-hero__badge-dot" />
              Plataforma institucional · Setor público
            </div>
            <h1 className="pub-hero__title">
              Controle total da sua frota
              <span>em um só lugar</span>
            </h1>
            <p className="pub-hero__lead">
              O CtrlFleet organiza veículos, reservas, manutenção e jornadas de motoristas em um fluxo
              único, da solicitação ao retorno do veículo, com transparência para gestores e
              auditores.
            </p>
            <ul className="pub-hero__points">
              {HERO_POINTS.map((point) => (
                <li key={point}>
                  <Icon name="check" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="pub-hero__actions">
              <ActionButton icon="logout" to="/login">
                Acessar sistema
              </ActionButton>
            </div>
          </div>

          <div className="pub-hero__scene-wrap">
            <FleetSceneAnimation variant="home" />
          </div>
        </section>

        <section className="pub-about" id="sobre" aria-labelledby="pub-about-title">
          <ScrollReveal as="div" className="pub-about__copy" variant="left">
            <span className="pub-kicker">Sobre o sistema</span>
            <h2 id="pub-about-title">Feito para a rotina real da gestão pública de frotas</h2>
            <p>
              Em prefeituras e órgãos públicos, cada saída de veículo precisa de controle: quem
              solicitou, quem aprovou, qual motorista conduziu e em qual quilometragem o carro
              retornou. O CtrlFleet centraliza essas informações sem planilhas paralelas.
            </p>
            <p>
              A interface segue o padrão visual dos painéis internos, cards, filtros e status
              claros, para que gestores, motoristas e solicitantes encontrem rapidamente o que
              precisam no dia a dia.
            </p>
          </ScrollReveal>
          <div className="pub-about__cards">
            <ScrollReveal as="article" className="pub-about__card" delay={0} variant="scale">
              <Icon name="fleet" />
              <h3>Frota visível</h3>
              <p>Status, documentação e histórico por veículo em tempo real.</p>
            </ScrollReveal>
            <ScrollReveal as="article" className="pub-about__card" delay={100} variant="scale">
              <Icon name="reservations" />
              <h3>Reservas rastreáveis</h3>
              <p>Do pedido à conclusão, com mapa e horários previstos.</p>
            </ScrollReveal>
            <ScrollReveal as="article" className="pub-about__card" delay={200} variant="scale">
              <Icon name="history" />
              <h3>Auditoria pronta</h3>
              <p>Eventos críticos registrados para prestação de contas.</p>
            </ScrollReveal>
          </div>
        </section>

        <section className="pub-metrics" id="indicadores" aria-label="Indicadores operacionais">
          {METRICS.map((metric, index) => (
            <ScrollReveal
              as="article"
              className="pub-metric"
              delay={index * 90}
              key={metric.label}
              variant="up"
            >
              <strong>{metric.value}</strong>
              <span className="pub-metric__label">{metric.label}</span>
              <span className="pub-metric__hint">{metric.hint}</span>
            </ScrollReveal>
          ))}
        </section>

        <section className="pub-workflow" id="fluxo" aria-labelledby="pub-workflow-title">
          <ScrollReveal as="header" className="pub-section-head pub-section-head--center" variant="up">
            <span className="pub-kicker">Fluxo operacional</span>
            <h2 id="pub-workflow-title">Como funciona na prática</h2>
            <p>
              Quatro etapas conectadas, cada uma com registro no sistema e responsável definido.
            </p>
          </ScrollReveal>
          <ol className="pub-workflow__steps">
            {WORKFLOW.map((item, index) => (
              <ScrollReveal
                as="li"
                className="pub-workflow__step"
                delay={index * 100}
                key={item.step}
                variant="up"
              >
                <span className="pub-workflow__step-num">{item.step}</span>
                <span className="pub-workflow__step-icon">
                  <Icon name={item.icon} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                {index < WORKFLOW.length - 1 ? (
                  <span className="pub-workflow__connector" aria-hidden="true" />
                ) : null}
              </ScrollReveal>
            ))}
          </ol>
        </section>

        <section className="pub-features" id="recursos" aria-labelledby="pub-features-title">
          <ScrollReveal as="header" className="pub-section-head" variant="up">
            <span className="pub-kicker">Módulos</span>
            <h2 id="pub-features-title">Tudo que o gestor precisa em um único sistema</h2>
            <p>
              Funcionalidades integradas para frota, reservas, manutenção, usuários e auditoria,
              sem alternar entre ferramentas desconectadas.
            </p>
          </ScrollReveal>
          <div className="pub-features__grid">
            {FEATURES.map((feature, index) => (
              <ScrollReveal
                as="article"
                className="pub-feature"
                delay={(index % 3) * 100}
                key={feature.title}
                variant="scale"
              >
                <span className="pub-feature__icon">
                  <Icon name={feature.icon} />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section className="pub-profiles" id="perfis" aria-labelledby="pub-profiles-title">
          <ScrollReveal as="header" className="pub-section-head pub-section-head--center" variant="up">
            <span className="pub-kicker">Perfis de acesso</span>
            <h2 id="pub-profiles-title">Cada usuário vê o que precisa</h2>
            <p>
              Permissões alinhadas à função, o motorista não aprova reservas; o solicitante não
              altera a frota.
            </p>
          </ScrollReveal>
          <div className="pub-profiles__grid">
            {PROFILES.map((profile, index) => (
              <ScrollReveal
                as="article"
                className="pub-profile-card"
                delay={index * 90}
                key={profile.role}
                variant="up"
              >
                <span className="pub-profile-card__icon">
                  <Icon name={profile.icon} />
                </span>
                <h3>{profile.role}</h3>
                <p>{profile.desc}</p>
                <ul>
                  {profile.access.map((item) => (
                    <li key={item}>
                      <Icon name="check" />
                      {item}
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section className="pub-benefits" aria-labelledby="pub-benefits-title">
          <ScrollReveal as="div" className="pub-benefits__inner" variant="scale">
            <header>
              <span className="pub-kicker">Benefícios</span>
              <h2 id="pub-benefits-title">Por que adotar o CtrlFleet</h2>
            </header>
            <ul className="pub-benefits__list">
              {BENEFITS.map((benefit, index) => (
                <ScrollReveal
                  as="li"
                  delay={index * 80}
                  key={benefit}
                  variant="left"
                >
                  <Icon name="check" />
                  <span>{benefit}</span>
                </ScrollReveal>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        <section className="pub-cta" aria-label="Chamada para acesso">
          <ScrollReveal as="div" className="pub-cta__inner" variant="up">
            <div>
              <h2>Pronto para organizar a frota do seu órgão?</h2>
              <p>
                Acesse com seu perfil institucional e comece a gerenciar reservas, veículos e
                checklists hoje mesmo.
              </p>
            </div>
            <ActionButton icon="logout" to="/login">
              Acessar sistema
            </ActionButton>
          </ScrollReveal>
        </section>

        <ScrollReveal as="footer" className="pub-footer" variant="up">
          <div className="pub-footer__main">
            <div className="pub-footer__brand">
              <img alt="" src="/ctrlfleet-logo-icon.png" />
              <strong>CtrlFleet</strong>
              <p>Gestão integrada de frotas para o setor público.</p>
            </div>

            <section
              className="pub-footer__team"
              id="equipe"
              aria-labelledby="pub-equipe-title"
            >
              <span className="pub-kicker">Equipe</span>
              <h2 className="pub-footer__team-title" id="pub-equipe-title">
                Desenvolvido por
              </h2>
              <ul className="pub-footer__devs">
                {DEVELOPERS.map((dev, index) => (
                  <ScrollReveal
                    as="li"
                    className="pub-footer__dev"
                    delay={index * 60}
                    key={dev.slug}
                    variant="scale"
                  >
                    <DeveloperAvatar name={dev.name} slug={dev.slug} />
                    <span className="pub-footer__dev-name">{dev.name}</span>
                  </ScrollReveal>
                ))}
              </ul>
              <p className="pub-footer__team-meta">Turma TI-2 · PMG ES 2026/1</p>
            </section>
          </div>
          <div className="pub-footer__bottom">
            <p className="pub-footer__copy">
              © {new Date().getFullYear()} CtrlFleet · Gestão inteligente de frotas públicas
            </p>
            <nav className="pub-footer__repo-tabs" aria-label="Repositório e documentação">
              <a
                className="pub-footer__repo-tab"
                href={REPO_BASE}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon name="reports" />
                <span>Repositório GitHub</span>
              </a>
              <a
                className="pub-footer__repo-tab"
                href={REPO_DOCS_URL}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon name="clipboard" />
                <span>Docs</span>
              </a>
            </nav>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
