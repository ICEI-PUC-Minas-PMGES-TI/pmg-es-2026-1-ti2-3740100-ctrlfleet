import { ActionButton } from './ActionButton';
import { Icon } from './Icon';
import { PageHeader } from './PageHeader';

export function PlaceholderPage({ ctaLabel, ctaTo, description, title }) {
  return (
    <div className="page-stack">
      <PageHeader subtitle={description} title={title} />
      <section className="placeholder-card">
        <div className="placeholder-card__icon">
          <Icon name="clipboard" />
        </div>
        <div className="placeholder-card__copy">
          <h2>Módulo pronto para evoluir</h2>
          <p>A navegação e o layout já estão organizados para receber este fluxo sem refatoração grande.</p>
        </div>
        <ActionButton icon="chevronRight" to={ctaTo} variant="secondary">
          {ctaLabel}
        </ActionButton>
      </section>
    </div>
  );
}
