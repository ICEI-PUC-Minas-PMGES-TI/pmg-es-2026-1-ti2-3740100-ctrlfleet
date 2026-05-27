import { useState } from 'react';

function developerInitials(name) {
  return name
    .split(' ')
    .filter((part) => part.length > 2 && !/^(de|da|do|dos)$/i.test(part))
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

/**
 * Exibe foto em `/team/{slug}.jpg` ou `/team/{slug}.png`.
 * Coloque o arquivo em `public/team/` para substituir o mockup.
 */
export function DeveloperAvatar({ name, slug }) {
  const [photoSrc, setPhotoSrc] = useState(() => `/team/${slug}.jpg`);
  const [showMockup, setShowMockup] = useState(false);

  function handleError() {
    if (photoSrc.endsWith('.jpg')) {
      setPhotoSrc(`/team/${slug}.png`);
      return;
    }
    setShowMockup(true);
  }

  return (
    <span className="pub-dev-avatar">
      {!showMockup ? (
        <img alt="" className="pub-dev-avatar__img" onError={handleError} src={photoSrc} />
      ) : null}
      {showMockup ? (
        <span className="pub-dev-avatar__mockup" title="Adicione a foto em public/team">
          <span className="pub-dev-avatar__initials">{developerInitials(name)}</span>
          <span className="pub-dev-avatar__hint">Foto</span>
        </span>
      ) : null}
    </span>
  );
}
