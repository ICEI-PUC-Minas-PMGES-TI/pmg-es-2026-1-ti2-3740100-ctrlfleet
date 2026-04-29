import { Link } from 'react-router-dom';
import { Icon } from './Icon';

function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function ActionButton({
  children,
  className,
  icon,
  to,
  type = 'button',
  variant = 'primary',
  ...props
}) {
  const baseClassName = joinClasses(
    'action-button',
    `action-button--${variant}`,
    icon ? 'action-button--with-icon' : '',
    className,
  );

  const content = (
    <>
      {icon ? <Icon className="action-button__icon" name={icon} /> : null}
      <span>{children}</span>
    </>
  );

  if (to) {
    return (
      <Link className={baseClassName} to={to} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button className={baseClassName} type={type} {...props}>
      {content}
    </button>
  );
}
