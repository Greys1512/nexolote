interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, total, pageSize, onPageChange }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const safe = Math.min(page, pages);
  return (
    <nav className="pagination" aria-label="Paginación">
      <button type="button" className="btn-secundario" onClick={() => onPageChange(safe - 1)} disabled={safe <= 1}>Anterior</button>
      <span className="pagination-info">Página {safe} de {pages} ({total} registros)</span>
      <button type="button" className="btn-secundario" onClick={() => onPageChange(safe + 1)} disabled={safe >= pages}>Siguiente</button>
    </nav>
  );
}
