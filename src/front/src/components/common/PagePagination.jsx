import { Icon } from './Icon';

function buildPageItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);

  const items = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) {
      items.push('ellipsis');
    }
    items.push(page);
  });

  return items;
}

export function PagePagination({
  currentPage = 1,
  onPageChange,
  pageSize = 5,
  totalItems = 0,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalItems);
  const pageItems = buildPageItems(safePage, totalPages);

  if (totalItems === 0) return null;

  return (
    <nav aria-label="Paginação" className="page-pagination">
      <span className="page-pagination__info">
        {start}–{end} de {totalItems}
      </span>

      <div className="page-pagination__controls">
        <button
          aria-label="Página anterior"
          className="page-pagination__arrow"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          type="button"
        >
          <Icon name="chevronLeft" />
        </button>

        <div className="page-pagination__numbers">
          {pageItems.map((item, index) =>
            item === 'ellipsis' ? (
              <span className="page-pagination__ellipsis" key={`ellipsis-${index}`}>
                …
              </span>
            ) : (
              <button
                aria-current={item === safePage ? 'page' : undefined}
                aria-label={`Página ${item}`}
                className={`page-pagination__num${item === safePage ? ' page-pagination__num--active' : ''}`}
                key={item}
                onClick={() => onPageChange(item)}
                type="button"
              >
                {item}
              </button>
            ),
          )}
        </div>

        <button
          aria-label="Próxima página"
          className="page-pagination__arrow"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          type="button"
        >
          <Icon name="chevronRight" />
        </button>
      </div>
    </nav>
  );
}
