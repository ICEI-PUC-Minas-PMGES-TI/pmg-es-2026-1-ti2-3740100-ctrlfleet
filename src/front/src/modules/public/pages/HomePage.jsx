import { Link } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';

const highlights = [
  {
    icon: 'fleet',
    label: 'Frota',
    text: 'Controle claro dos veículos e da disponibilidade.',
  },
  {
    icon: 'reservations',
    label: 'Reservas',
    text: 'Solicitações e aprovações no fluxo certo.',
  },
  {
    icon: 'maintenance',
    label: 'Manutenção',
    text: 'Acompanhamento simples para reduzir paradas.',
  },
];

export function HomePage() {
  return (
    <main className="public-page">
      <nav className="public-nav" aria-label="Navegação principal">
        <Link className="public-brand" to="/">
          <img alt="CtrlFleet" src="/ctrlfleet-logo-icon.png" />
          <span>CtrlFleet</span>
        </Link>
        <div className="public-nav__actions">
          <a href="#recursos">Recursos</a>
          <ActionButton className="public-nav__login" to="/login" variant="secondary">
            Entrar
          </ActionButton>
        </div>
      </nav>

      <section className="home-hero">
        <div className="home-hero__copy">
          <span className="public-eyebrow">Gestão pública de frotas</span>
          <h1>CtrlFleet</h1>
          <p>
            Uma plataforma direta para organizar frota, reservas e manutenção com a clareza que a rotina
            pública precisa.
          </p>
          <div className="home-hero__actions">
            <ActionButton icon="logout" to="/login">
              Acessar sistema
            </ActionButton>
          </div>
        </div>

        <div className="home-brand-panel" aria-label="Identidade CtrlFleet">
          <div className="home-brand-panel__mark">
            <img alt="" src="/ctrlfleet-logo-icon.png" />
          </div>
          <span>controle integrado</span>
        </div>
      </section>

      <section className="home-highlights" id="recursos" aria-label="Recursos do CtrlFleet">
        {highlights.map((item) => (
          <article className="home-highlight" key={item.label}>
            <span className="home-highlight__icon">
              <Icon name={item.icon} />
            </span>
            <h2>{item.label}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
