import { useEffect } from 'react';
import { Icon } from './Icon';

export function Modal({
  children,
  footer,
  onClose,
  open,
  size = 'md',
  subtitle,
  title,
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKey(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
    >
      <div
        className={`modal-shell modal-shell--${size}`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-shell__header">
          <div className="modal-shell__copy">
            {title ? <h2>{title}</h2> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button
            aria-label="Fechar modal"
            className="modal-shell__close"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" />
          </button>
        </header>

        <div className="modal-shell__body">{children}</div>

        {footer ? <footer className="modal-shell__footer">{footer}</footer> : null}
      </div>
    </div>
  );
}
