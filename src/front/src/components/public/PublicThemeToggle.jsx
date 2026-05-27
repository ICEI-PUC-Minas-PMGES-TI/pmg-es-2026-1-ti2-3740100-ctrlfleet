import { Icon } from '../common/Icon';

export function PublicThemeToggle({ theme, onToggle }) {
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      className="pub-theme-toggle"
      onClick={onToggle}
      aria-label={isLight ? 'Ativar tema escuro' : 'Ativar tema claro'}
      title={isLight ? 'Usar tema escuro' : 'Usar tema claro'}
    >
      <Icon name={isLight ? 'moon' : 'sun'} />
      <span className="pub-theme-toggle__label">{isLight ? 'Escuro' : 'Claro'}</span>
    </button>
  );
}
