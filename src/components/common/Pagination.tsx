interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) => {
  const safePageSize = pageSize > 0 ? pageSize : 1;
  const totalPages = Math.max(Math.ceil(totalItems / safePageSize), 1);

  if (totalPages <= 1) {
    return null;
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="pagination panel">
      <span className="pagination__info">
        Page {currentPage} / {totalPages}
      </span>

      <div className="pagination__buttons">
        <button className="neon-button" type="button" onClick={handlePrev} disabled={currentPage === 1}>
          Prev
        </button>
        <button
          className="neon-button"
          type="button"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};