import { useEffect, useState, type SubmitEvent, type ReactNode } from 'react';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const MIN_TOTAL_PAGES = 1;
const MIN_PAGE = 1;

const clampPage = (page: number, totalPages: number): number =>
  Math.min(Math.max(page, MIN_PAGE), totalPages);

const buildPageInfo = (currentPage: number, totalPages: number): ReactNode => (
  <span className="pagination__info">
    Page {currentPage} / {totalPages}
  </span>
);

const buildPrevButton = (currentPage: number, onPageChange: (page: number) => void): ReactNode => {
  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <button className="neon-button" type="button" onClick={handlePrev} disabled={currentPage === 1}>
      Prev
    </button>
  );
};

const buildNextButton = (
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void,
): ReactNode => {
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <button
      className="neon-button"
      type="button"
      onClick={handleNext}
      disabled={currentPage === totalPages}
    >
      Next
    </button>
  );
};

export const Pagination = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) => {
  const safePageSize = pageSize > 0 ? pageSize : 1;
  const totalPages = Math.max(Math.ceil(totalItems / safePageSize), MIN_TOTAL_PAGES);
  const [pageInput, setPageInput] = useState(String(currentPage));

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  if (totalPages <= MIN_TOTAL_PAGES && totalItems <= 0) {
    return null;
  }

  const handleGoToPage = (event: SubmitEvent) => {
    event.preventDefault();

    const parsed = Number(pageInput);

    if (!Number.isInteger(parsed) || Number.isNaN(parsed)) {
      setPageInput(String(currentPage));
      return;
    }

    const target = clampPage(parsed, totalPages);
    setPageInput(String(target));

    if (target !== currentPage) {
      onPageChange(target);
    }
  };

  return (
    <div className="pagination panel">
      {buildPageInfo(currentPage, totalPages)}
      <div className="pagination__buttons">
        {buildPrevButton(currentPage, onPageChange)}
        {buildNextButton(currentPage, totalPages, onPageChange)}
        <form className="pagination__jump" onSubmit={handleGoToPage}>
          <input
            className="neon-input pagination__jump-input"
            type="number"
            inputMode="numeric"
            min={MIN_PAGE}
            max={totalPages}
            value={pageInput}
            onChange={event => setPageInput(event.target.value)}
            aria-label="Go to page"
          />
          <button className="neon-button neon-button--mini" type="submit">
            Go
          </button>
        </form>
      </div>
    </div>
  );
};
