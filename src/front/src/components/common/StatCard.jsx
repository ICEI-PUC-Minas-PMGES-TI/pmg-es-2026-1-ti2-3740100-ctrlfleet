import { Icon } from './Icon';

export function StatCard({ caption, icon, title, value }) {
  return (
    <article className="stat-card">
      <div className="stat-card__icon">
        <Icon name={icon} />
      </div>
      <div>
        <p className="stat-card__value">{value}</p>
        <h3>{title}</h3>
        <span>{caption}</span>
      </div>
    </article>
  );
}
