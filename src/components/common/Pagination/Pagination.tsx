import type { ReactNode } from 'react';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const MIN_TOTAL_PAGES = 1;

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

  if (totalPages <= MIN_TOTAL_PAGES && totalItems <= 0) {
    return null;
  }

  return (
    <div className="pagination panel">
      {buildPageInfo(currentPage, totalPages)}
      <div className="pagination__buttons">
        {buildPrevButton(currentPage, onPageChange)}
        {buildNextButton(currentPage, totalPages, onPageChange)}
      </div>
    </div>
  );
};
