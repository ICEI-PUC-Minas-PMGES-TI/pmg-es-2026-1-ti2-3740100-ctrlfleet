import { ActionButton } from './ActionButton';

export function PageHeader({
  actionDisabled,
  actionIcon,
  actionLabel,
  actionTo,
  eyebrow,
  onSecondaryAction,
  secondaryActionIcon,
  secondaryActionLabel,
  subtitle,
  title,
}) {
  const hasActions = Boolean(secondaryActionLabel || actionLabel);

  return (
    <div className="page-header">
      <div className="page-header__copy">
        {eyebrow ? <span className="page-header__eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {hasActions ? (
        <div className="page-header__actions">
          {secondaryActionLabel ? (
            <ActionButton icon={secondaryActionIcon} onClick={onSecondaryAction} variant="secondary">
              {secondaryActionLabel}
            </ActionButton>
          ) : null}
          {actionLabel ? (
            <ActionButton disabled={actionDisabled} icon={actionIcon} to={actionDisabled ? undefined : actionTo}>
              {actionLabel}
            </ActionButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
