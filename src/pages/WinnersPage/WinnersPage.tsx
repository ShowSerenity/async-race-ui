import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchWinners, setWinnersPage } from '../../features/winnersSlice';
import { Pagination } from '../../components/common/Pagination/Pagination';
import { WinnersTable } from '../../components/winners/WinnersTable/WinnersTable';
import './WinnersPage.css';

const WINNERS_PER_PAGE = 10;

export const WinnersPage = () => {
  const dispatch = useAppDispatch();
  const { winners, page, totalCount, sort, order, isLoading } = useAppSelector(state => state.winners);

  useEffect(() => {
    dispatch(fetchWinners());
  }, [dispatch, page, sort, order]);

  const goToPage = (nextPage: number) => {
    dispatch(setWinnersPage(nextPage));
  };

  const startIndex = (page - 1) * WINNERS_PER_PAGE;

  return (
    <section className="page winners-page">
      <h1 className="page__title">Winners</h1>

      {isLoading ? (
        <div className="empty-state">Loading winners...</div>
      ) : (
        <WinnersTable winners={winners} startIndex={startIndex} />
      )}

      <Pagination
        currentPage={page}
        totalItems={totalCount}
        pageSize={WINNERS_PER_PAGE}
        onPageChange={goToPage}
      />
    </section>
  );
};