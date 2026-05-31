import { useEffect, useRef, useState } from 'react';

/**
 * Revela o conteúdo ao entrar na viewport (Intersection Observer).
 * @param {'up' | 'left' | 'right' | 'scale'} variant
 */
export function ScrollReveal({
  as: Tag = 'div',
  children,
  className = '',
  delay = 0,
  variant = 'up',
  threshold = 0.12,
  rootMargin = '0px 0px -8% 0px',
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const classes = [
    'pub-reveal',
    `pub-reveal--${variant}`,
    visible ? 'pub-reveal--visible' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      ref={ref}
      className={classes}
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
