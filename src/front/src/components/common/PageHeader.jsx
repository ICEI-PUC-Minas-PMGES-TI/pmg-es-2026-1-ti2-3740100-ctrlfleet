import { ActionButton } from './ActionButton';

export function PageHeader({ actionDisabled, actionIcon, actionLabel, actionTo, eyebrow, subtitle, title }) {
  return (
    <div className="page-header">
      <div className="page-header__copy">
        {eyebrow ? <span className="page-header__eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actionLabel ? (
        <ActionButton disabled={actionDisabled} icon={actionIcon} to={actionDisabled ? undefined : actionTo}>
          {actionLabel}
        </ActionButton>
      ) : null}
    </div>
  );
}
