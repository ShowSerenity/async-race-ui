import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  clearWinner,
  requestStart,
  resetRaceState,
  setRaceInProgress,
  startNewRaceAttempt,
} from '../../../features/raceSlice';
import { fetchCars } from '../../../features/garageSlice';
import { createRandomCarsPayload } from '../../../helpers/race';
import { createCar, stopEngine } from '../../../api/api';
import { WinnerBanner } from '../WinnerBanner/WinnerBanner';
import './RaceControls.css';

const stopAllCars = async (carIds: number[]) => {
  await Promise.allSettled(carIds.map(carId => stopEngine(carId)));
};

export const RaceControls = () => {
  const dispatch = useAppDispatch();
  const { cars, page } = useAppSelector(state => state.garage);
  const { isRaceInProgress, cars: raceCars, winner } = useAppSelector(state => state.race);

  const refreshCars = async () => {
    await dispatch(fetchCars(page));
  };

  const handleGenerateRandomCars = async () => {
    const payload = createRandomCarsPayload();
    await Promise.all(payload.map(car => createCar(car)));
    await refreshCars();
  };

  const handleStartRace = () => {
    if (isRaceInProgress || cars.length === 0) {
      return;
    }

    dispatch(startNewRaceAttempt());
    dispatch(setRaceInProgress(true));
    dispatch(requestStart(cars.map(car => car.id)));
  };

  const handleResetRace = async () => {
    await stopAllCars(cars.map(car => car.id));
    dispatch(resetRaceState());
  };

  const handleCloseWinnerBanner = () => {
    dispatch(clearWinner());
  };

  useEffect(() => {
    if (!isRaceInProgress || cars.length === 0) {
      return;
    }

    const allSettled = cars.every(car => {
      const state = raceCars[car.id];
      return state && !state.isDriving && (state.isFinished || state.hasError);
    });

    if (allSettled) {
      dispatch(setRaceInProgress(false));
    }
  }, [raceCars, cars, isRaceInProgress, dispatch]);

  return (
    <section className="race-controls panel">
      <div className="controls__group">
        <button
          className="neon-button neon-button--green"
          type="button"
          onClick={handleStartRace}
          disabled={isRaceInProgress || cars.length === 0}
        >
          Race
        </button>
        <button className="neon-button neon-button--orange" type="button" onClick={handleResetRace}>
          Reset
        </button>
        <button
          className="neon-button neon-button--pink"
          type="button"
          onClick={handleGenerateRandomCars}
          disabled={isRaceInProgress}
        >
          Generate 100 cars
        </button>
      </div>

      {winner && (
        <WinnerBanner name={winner.name} time={winner.time} onClose={handleCloseWinnerBanner} />
      )}
    </section>
  );
};
