export function DocumentPills({ documents }) {
  if (documents.length === 0) {
    return <p className="admin-empty__text">Nenhum documento cadastrado para este veículo.</p>;
  }

  return (
    <div className="document-pills">
      {documents.map((document) => (
        <span
          className={`document-pill document-pill--${document.state}`}
          key={document.label}
          title={`${document.label}: ${document.dueDate}`}
        >
          {document.shortLabel}
        </span>
      ))}
    </div>
  );
}
