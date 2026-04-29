export function DocumentPills({ documents }) {
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
