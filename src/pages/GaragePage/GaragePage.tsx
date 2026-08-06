import { useEffect } from 'react';
import { fetchCars, setPage } from '../../features/garageSlice';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { CarForm } from '../../components/garage/CarForm/CarForm';
import { CarItem } from '../../components/garage/CarItem/CarItem';
import { Pagination } from '../../components/common/Pagination/Pagination';
import { RaceControls } from '../../components/garage/RaceControls/RaceControls';
import './GaragePage.css';

const CARS_PER_PAGE = 7;

const renderGarageContent = (
  cars: Array<{ id: number; name: string; color: string }>,
  isLoading: boolean,
) => {
  if (isLoading) {
    return <div className="empty-state">Loading garage...</div>;
  }

  if (cars.length === 0) {
    return <div className="empty-state">No cars</div>;
  }

  return (
    <div className="garage-list">
      {cars.map(car => (
        <CarItem key={car.id} car={car} />
      ))}
    </div>
  );
};

export const GaragePage = () => {
  const dispatch = useAppDispatch();
  const { cars, page, totalCount, isLoading } = useAppSelector(state => state.garage);

  useEffect(() => {
    dispatch(fetchCars(page));
  }, [dispatch, page]);

  const goToPage = (nextPage: number) => {
    dispatch(setPage(nextPage));
  };

  return (
    <section className="page garage-page">
      <h1 className="page__title">Garage</h1>

      <CarForm />
      <RaceControls />

      <div className="garage-layout">
        <div className="garage-track">
          <div className="garage-track-label-start">START</div>
          <div className="garage-track-label-finish">FINISH</div>
          <div className="track-header" />

          {renderGarageContent(cars, isLoading)}

          <div className="track-footer" />
        </div>

        <div className="garage-bottom">
          <div className="garage-counter">
            Garage (<span>{totalCount}</span>)
          </div>

          <Pagination
            currentPage={page}
            totalItems={totalCount}
            pageSize={CARS_PER_PAGE}
            onPageChange={goToPage}
          />
        </div>
      </div>
    </section>
  );
};
