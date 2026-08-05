import { useAppDispatch, useAppSelector } from '../../hooks';
import { resetRaceState, setRaceInProgress } from '../../features/raceSlice';
import { fetchCars } from '../../features/garageSlice';
import { upsertWinner } from '../../features/winnersSlice';
import { createRandomCarsPayload } from '../../helpers/race';
import { calcRaceTimeSeconds } from '../../helpers/animation';
import { createCar, drive, startEngine, stopEngine } from '../../api/api';
import './RaceControls.css';

type RaceResult = { id: number; time: number } | null;

const runCarRace = async (carId: number): Promise<RaceResult> => {
  try {
    const startResponse = await startEngine(carId);
    const driveResponse = await drive(carId);

    if (!driveResponse.success) {
      return null;
    }

    return {
      id: carId,
      time: calcRaceTimeSeconds(startResponse.velocity, startResponse.distance),
    };
  } catch {
    return null;
  }
};

const findWinner = (results: RaceResult[]): { id: number; time: number } | null => {
  const finishedCars = results.filter(
    (item): item is { id: number; time: number } => item !== null,
  );

  if (finishedCars.length === 0) {
    return null;
  }

  return finishedCars.reduce((best, current) => (current.time < best.time ? current : best));
};

const stopAllCars = async (carIds: number[]) => {
  await Promise.allSettled(carIds.map(carId => stopEngine(carId)));
};

export const RaceControls = () => {
  const dispatch = useAppDispatch();
  const { cars, page } = useAppSelector(state => state.garage);
  const { isRaceInProgress } = useAppSelector(state => state.race);

  const refreshCars = async () => {
    await dispatch(fetchCars(page));
  };

  const handleGenerateRandomCars = async () => {
    const payload = createRandomCarsPayload();
    await Promise.all(payload.map(car => createCar(car)));
    await refreshCars();
  };

  const handleStartRace = async () => {
    if (isRaceInProgress || cars.length === 0) {
      return;
    }

    dispatch(setRaceInProgress(true));

    const results = await Promise.all(cars.map(car => runCarRace(car.id)));
    const winner = findWinner(results);

    if (winner) {
      await dispatch(upsertWinner(winner));
    }

    dispatch(setRaceInProgress(false));
  };

  const handleResetRace = async () => {
    await stopAllCars(cars.map(car => car.id));
    dispatch(resetRaceState());
  };

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
        >
          Generate 100 cars
        </button>
      </div>
    </section>
  );
};
