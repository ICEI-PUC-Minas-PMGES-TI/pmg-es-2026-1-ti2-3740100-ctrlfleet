import { Icon } from './Icon';

export function StatCard({
  caption,
  icon,
  layout = 'horizontal',
  title,
  value,
  variant = 'default',
}) {
  const className = [
    'stat-card',
    layout === 'vertical' ? 'stat-card--vertical' : '',
    variant !== 'default' ? `stat-card--${variant}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={className}>
      <div className="stat-card__icon" aria-hidden="true">
        <Icon name={icon} />
      </div>
      <div className="stat-card__content">
        <p className="stat-card__value">{value}</p>
        <h3 className="stat-card__title">{title}</h3>
        {caption ? <span className="stat-card__caption">{caption}</span> : null}
      </div>
    </article>
  );
}
