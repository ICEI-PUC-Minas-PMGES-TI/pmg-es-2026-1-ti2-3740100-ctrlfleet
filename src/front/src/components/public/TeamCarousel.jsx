import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '../common/Icon';
import { DeveloperAvatar } from './DeveloperAvatar';

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD = 48;

export function TeamCarousel({ developers }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);
  const total = developers.length;

  const goTo = useCallback(
    (index) => {
      if (total === 0) return;
      setActiveIndex(((index % total) + total) % total);
    },
    [total],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (isPaused || total <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, total]);

  function handleTouchStart(event) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event) {
    if (touchStartX.current == null) return;

    const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) goNext();
    else goPrev();
  }

  if (total === 0) return null;

  const activeDeveloper = developers[activeIndex];

  return (
    <div
      className="pub-team-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
      role="region"
      aria-label="Equipe de desenvolvimento"
      aria-roledescription="carrossel"
    >
      <div className="pub-team-carousel__frame">
        <button
          aria-label="Desenvolvedor anterior"
          className="pub-team-carousel__nav pub-team-carousel__nav--prev"
          onClick={goPrev}
          type="button"
        >
          <Icon name="chevronLeft" />
        </button>

        <div
          className="pub-team-carousel__viewport"
          onTouchEnd={handleTouchEnd}
          onTouchStart={handleTouchStart}
        >
          <div
            aria-live="polite"
            className="pub-team-carousel__track"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {developers.map((dev) => (
              <article className="pub-team-carousel__slide" id={`pub-team-slide-${dev.slug}`} key={dev.slug}>
                <DeveloperAvatar
                  className="pub-dev-avatar--featured"
                  name={dev.name}
                  slug={dev.slug}
                />
                <p className="pub-team-carousel__name">{dev.name}</p>
              </article>
            ))}
          </div>
        </div>

        <button
          aria-label="Próximo desenvolvedor"
          className="pub-team-carousel__nav pub-team-carousel__nav--next"
          onClick={goNext}
          type="button"
        >
          <Icon name="chevronRight" />
        </button>
      </div>

      <div className="pub-team-carousel__dots" role="tablist" aria-label="Selecionar desenvolvedor">
        {developers.map((dev, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              aria-controls={`pub-team-slide-${dev.slug}`}
              aria-label={`Ver ${dev.name}`}
              aria-selected={isActive}
              className={`pub-team-carousel__dot${isActive ? ' is-active' : ''}`}
              id={`pub-team-tab-${dev.slug}`}
              key={dev.slug}
              onClick={() => goTo(index)}
              role="tab"
              type="button"
            >
              <DeveloperAvatar className="pub-dev-avatar--thumb" name={dev.name} slug={dev.slug} />
            </button>
          );
        })}
      </div>

      <p className="pub-team-carousel__counter" aria-hidden="true">
        {activeIndex + 1} / {total}
      </p>
      <span className="sr-only">
        Exibindo {activeDeveloper.name}, {activeIndex + 1} de {total}
      </span>
    </div>
  );
}
