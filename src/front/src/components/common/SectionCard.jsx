export function SectionCard({ children, subtitle, title }) {
  return (
    <section className="section-card">
      {title || subtitle ? (
        <header className="section-card__header">
          {title ? <h2>{title}</h2> : null}
          {subtitle ? <p>{subtitle}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
