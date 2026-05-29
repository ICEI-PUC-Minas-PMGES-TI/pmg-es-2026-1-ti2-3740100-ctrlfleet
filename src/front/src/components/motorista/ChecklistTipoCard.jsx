import { Link } from 'react-router-dom';

export function ChecklistTipoCard({ tipo, to, reserva, showDescription = true }) {
  const done = Boolean(tipo.concluido);

  return (
    <article className={`checklist-tipo-card ${done ? 'checklist-tipo-card--done' : ''}`}>
      <div className="checklist-tipo-card__content">
        <div className="checklist-tipo-card__head">
          <h3 className="checklist-tipo-card__title">{tipo.nome}</h3>
          <span className={`checklist-tipo-card__badge ${done ? 'is-done' : ''}`}>
            {done ? 'Concluído' : 'Pendente'}
          </span>
        </div>
        {showDescription && tipo.descricao ? (
          <p className="checklist-tipo-card__desc">{tipo.descricao}</p>
        ) : null}
        <p className="checklist-tipo-card__progress">
          <span>{tipo.itensConcluidos}/{tipo.totalItens}</span>
          <span>itens</span>
        </p>
      </div>
      <footer className="checklist-tipo-card__footer">
        <Link
          className={`checklist-tipo-card__action ${done ? 'checklist-tipo-card__action--outline' : ''}`}
          state={{ reserva }}
          to={to}
        >
          {done ? 'Revisar' : 'Preencher'}
        </Link>
      </footer>
    </article>
  );
}
