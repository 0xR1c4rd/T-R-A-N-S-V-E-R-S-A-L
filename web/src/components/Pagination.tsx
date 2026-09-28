interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, limit, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <button
        type="button"
        className="btn btn-secondary"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Précédent
      </button>
      <span>
        Page {page} / {totalPages} ({total} résultats)
      </span>
      <button
        type="button"
        className="btn btn-secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Suivant →
      </button>
    </div>
  );
}