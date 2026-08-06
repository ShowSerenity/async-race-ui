## src/api/api.ts
```ts
import type {
  Car,
  EngineStartStopResponse,
  PaginatedResponse,
  SortField,
  SortOrder,
  Winner,
} from '../types/types';

const BASE_URL = 'http://127.0.0.1:3000';

const GARAGE_URL = `${BASE_URL}/garage`;
const ENGINE_URL = `${BASE_URL}/engine`;
const WINNERS_URL = `${BASE_URL}/winners`;

const CARS_PER_PAGE = 7;
const WINNERS_PER_PAGE = 10;

const HTTP_STATUS = {
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error handling
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json() as Promise<T>;
};

// Garage API
export const getCars = async (page: number): Promise<PaginatedResponse<Car>> => {
  const response = await fetch(`${GARAGE_URL}?_page=${page}&_limit=${CARS_PER_PAGE}`);
  const totalCount = Number(response.headers.get('X-Total-Count') ?? 0);
  const items = await response.json();
  return { items, totalCount };
};

export const getCar = async (id: number): Promise<Car> => {
  const response = await fetch(`${GARAGE_URL}/${id}`);
  return handleResponse<Car>(response);
};

export const createCar = async (car: Omit<Car, 'id'>): Promise<Car> => {
  const response = await fetch(GARAGE_URL, {
    method: 'POST',
    body: JSON.stringify(car),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse<Car>(response);
};

export const updateCar = async (id: number, car: Omit<Car, 'id'>): Promise<Car> => {
  const response = await fetch(`${GARAGE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(car),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse<Car>(response);
};

export const deleteCar = async (id: number): Promise<void> => {
  await fetch(`${GARAGE_URL}/${id}`, {
    method: 'DELETE',
  });
};

// Engine API
export const startEngine = async (id: number): Promise<EngineStartStopResponse> => {
  const response = await fetch(`${ENGINE_URL}?id=${id}&status=started`, {
    method: 'PATCH',
  });
  return handleResponse<EngineStartStopResponse>(response);
};

export const stopEngine = async (id: number): Promise<EngineStartStopResponse> => {
  const response = await fetch(`${ENGINE_URL}?id=${id}&status=stopped`, {
    method: 'PATCH',
  });
  return handleResponse<EngineStartStopResponse>(response);
};

export const drive = async (id: number): Promise<{ success: boolean }> => {
  const response = await fetch(`${ENGINE_URL}?id=${id}&status=drive`, {
    method: 'PATCH',
  });

  if (response.status === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    return { success: false };
  }

  return handleResponse<{ success: boolean }>(response);
};

// Winners API
export const getWinners = async (
  page: number,
  sort: SortField | null,
  order: SortOrder | null,
): Promise<PaginatedResponse<Winner>> => {
  const params = new URLSearchParams({
    _page: String(page),
    _limit: String(WINNERS_PER_PAGE),
  });

  if (sort && order) {
    params.append('_sort', sort);
    params.append('_order', order);
  }

  const response = await fetch(`${WINNERS_URL}?${params.toString()}`);
  const totalCount = Number(response.headers.get('X-Total-Count') ?? 0);
  const items = await response.json();
  return { items, totalCount };
};

export const getWinner = async (id: number): Promise<Winner | null> => {
  const response = await fetch(`${WINNERS_URL}/${id}`);

  if (response.status === HTTP_STATUS.NOT_FOUND) {
    return null;
  }

  return handleResponse<Winner>(response);
};

export const createWinner = async (winner: Winner): Promise<Winner> => {
  const response = await fetch(WINNERS_URL, {
    method: 'POST',
    body: JSON.stringify(winner),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse<Winner>(response);
};

export const updateWinner = async (winner: Winner): Promise<Winner> => {
  const response = await fetch(`${WINNERS_URL}/${winner.id}`, {
    method: 'PUT',
    body: JSON.stringify(winner),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse<Winner>(response);
};

export const deleteWinner = async (id: number): Promise<void> => {
  await fetch(`${WINNERS_URL}/${id}`, {
    method: 'DELETE',
  });
};
```

## src/App.tsx
```tsx
import { Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { GaragePage } from './pages/GaragePage/GaragePage';
import { WinnersPage } from './components/winners/WinnersPage';

const App = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Navigate to="/garage" replace />} />
      <Route path="/garage" element={<GaragePage />} />
      <Route path="/winners" element={<WinnersPage />} />
    </Routes>
  </Layout>
);

export default App;
```

## src/app/store.ts
```ts
import { configureStore } from '@reduxjs/toolkit';
import garageReducer from '../features/garageSlice';
import winnersReducer from '../features/winnersSlice';
import raceReducer from '../features/raceSlice';

export const store = configureStore({
  reducer: {
    garage: garageReducer,
    winners: winnersReducer,
    race: raceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## src/components/common/CarIcon/CarIcon.css
```css
.car-icon {
  width: 100%;
  height: 100%;
  display: block;
}```

## src/components/common/CarIcon/CarIcon.tsx
```tsx
import './CarIcon.css';

interface CarIconProps {
  color: string;
}

export const CarIcon = ({ color }: CarIconProps) => {
  return (
    <svg
      className="car-icon"
      viewBox="0 0 512 512"
      aria-hidden="true"
      focusable="false"
      style={{ color }}
    >
      <defs>
        <filter id="car-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#car-glow)" transform="translate(512 0) scale(-1 1)">
        <path
          d=""
          style={{
            fill: 'currentColor',
            stroke: 'rgba(255,255,255,0.25)',
            strokeWidth: 1,
          }}
          transform="translate(0 -540.362)"
        />
      </g>
    </svg>
  );
};
```

## src/components/common/Pagination/Pagination.css
```css
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
}

.pagination__info {
  color: var(--text-soft);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 13px;
}

.pagination__buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 600px) {
  .pagination {
    width: 100%;
    justify-content: space-between;
  }
}```

## src/components/common/Pagination/Pagination.tsx
```tsx
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
```

## src/components/garage/CarForm/CarForm.css
```css
.neon-input {
  min-height: 38px;
  min-width: 220px;
  padding: 0 14px;
  border-radius: 11px;
  border: 1px solid rgba(126, 231, 255, 0.45);
  background: rgba(243, 246, 255, 0.96);
  color: #111827;
  outline: none;
}

.neon-input:focus {
  border-color: rgba(123, 255, 154, 0.9);
  box-shadow: 0 0 0 3px rgba(123, 255, 154, 0.18);
}

.neon-color {
  width: 38px;
  height: 38px;
  padding: 0;
  border: 2px solid rgba(255, 255, 255, 0.55);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}

.neon-color::-webkit-color-swatch-wrapper {
  padding: 0;
}

.neon-color::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
}

@media (max-width: 900px) {
  .neon-input {
    min-width: 180px;
    flex: 1 1 180px;
  }
}

@media (max-width: 600px) {
  .neon-input {
    width: 100%;
    min-width: 0;
  }
}```

## src/components/garage/CarForm/CarForm.tsx
```tsx
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  createCarThunk,
  fetchCars,
  setSelectedCarId,
  updateCarThunk,
} from '../../../features/garageSlice';
import { isValidCarName, normalizeCarName, MAX_NAME_LENGTH } from '../../../helpers/carValidation';
import './CarForm.css';

const DEFAULT_COLOR = '#000000';

export const CarForm = () => {
  const dispatch = useAppDispatch();
  const { cars, selectedCarId, page } = useAppSelector(state => state.garage);

  const [createName, setCreateName] = useState('');
  const [createColor, setCreateColor] = useState(DEFAULT_COLOR);
  const [updateName, setUpdateName] = useState('');
  const [updateColor, setUpdateColor] = useState(DEFAULT_COLOR);

  useEffect(() => {
    if (!selectedCarId) {
      setUpdateName('');
      setUpdateColor(DEFAULT_COLOR);
      return;
    }

    const selectedCar = cars.find(car => car.id === selectedCarId);

    if (selectedCar) {
      setUpdateName(selectedCar.name);
      setUpdateColor(selectedCar.color);
    }
  }, [cars, selectedCarId]);

  const refreshPageCars = async () => {
    await dispatch(fetchCars(page));
  };

  const handleCreate = async () => {
    if (!isValidCarName(createName)) {
      return;
    }

    await dispatch(
      createCarThunk({
        name: normalizeCarName(createName),
        color: createColor,
      }),
    );

    setCreateName('');
    setCreateColor(DEFAULT_COLOR);
    await refreshPageCars();
  };

  const handleUpdate = async () => {
    if (!selectedCarId || !isValidCarName(updateName)) {
      return;
    }

    await dispatch(
      updateCarThunk({
        id: selectedCarId,
        car: {
          name: normalizeCarName(updateName),
          color: updateColor,
        },
      }),
    );

    dispatch(setSelectedCarId(null));
    setUpdateName('');
    setUpdateColor(DEFAULT_COLOR);
    await refreshPageCars();
  };

  return (
    <section className="controls panel">
      <div className="controls__group">
        <input
          className="neon-input"
          type="text"
          value={createName}
          onChange={event => setCreateName(event.target.value)}
          placeholder="Type car brand"
          maxLength={MAX_NAME_LENGTH}
        />
        <input
          className="neon-color"
          type="color"
          value={createColor}
          onChange={event => setCreateColor(event.target.value)}
        />
        <button
          className="neon-button neon-button--pink"
          type="button"
          onClick={handleCreate}
          disabled={!isValidCarName(createName)}
        >
          Create
        </button>
      </div>

      <div className="controls__group">
        <input
          className="neon-input"
          type="text"
          value={updateName}
          onChange={event => setUpdateName(event.target.value)}
          placeholder="Type car brand"
          maxLength={MAX_NAME_LENGTH}
          disabled={!selectedCarId}
        />
        <input
          className="neon-color"
          type="color"
          value={updateColor}
          onChange={event => setUpdateColor(event.target.value)}
          disabled={!selectedCarId}
        />
        <button
          className="neon-button neon-button--pink"
          type="button"
          onClick={handleUpdate}
          disabled={!selectedCarId || !isValidCarName(updateName)}
        >
          Update
        </button>
      </div>
    </section>
  );
};
```

## src/components/garage/CarItem/CarItem.css
```css
.car-row {
  display: grid;
  grid-template-columns: 210px 1fr;
  grid-template-areas: 'controls track';
  min-height: 92px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  position: relative;
}

.car-row:first-child {
  border-top: none;
}

.car-row__controls {
  grid-area: controls;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 10px 12px 10px 0;
  min-width: 0;
  position: relative;
  /* Кнопки должны быть выше глобальных линий старта/финиша
     (z-index: 2 на .garage-track::before/::after), иначе на
     мобильном линия проходит поверх них. */
  z-index: 4;
  background: var(--bg);
}

.car-row__action {
  display: flex;
  align-items: center;
  gap: 8px;
}

.car-action-btn {
  width: 116px;
  justify-content: center;
}

.car-key-btn {
  width: 44px;
  justify-content: center;
  padding-inline: 0;
}

.car-row__track {
  grid-area: track;
  position: relative;
  min-height: 92px;
  overflow: hidden;
}

.car-row__track::before,
.car-row__track::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  z-index: 1;
}

.car-row__track::before {
  left: 72px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.55);
}

.car-row__track::after {
  right: 10px;
  background: rgba(123, 255, 154, 0.95);
  box-shadow: 0 0 8px rgba(123, 255, 154, 0.55);
}

.car-row__name {
  position: absolute;
  left: 46%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--font-display);
  font-size: clamp(14px, 3.4vw, 24px);
  letter-spacing: 0.05em;
  color: var(--text-soft);
  text-transform: uppercase;
  white-space: nowrap;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
}

.car-icon-wrap {
  position: absolute;
  left: -42px;
  top: 50%;
  width: 160px;
  height: 72px;
  z-index: 2;
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.15))
    drop-shadow(0 0 2px currentColor);
}

@media (max-width: 900px) {
  .car-row__name {
    font-size: clamp(13px, 3vw, 20px);
    margin-left: 20px;
  }
}

@media (max-width: 600px) {
  .car-row {
    grid-template-columns: 1fr;
    grid-template-areas:
      'controls'
      'track';
  }

  .car-row__controls {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    padding: 10px 0;
  }

  .car-row__action {
    flex: 1 1 calc(50% - 4px);
    justify-content: center;
  }

  .car-action-btn {
    flex: 1 1 auto;
    width: auto;
    min-width: 0;
  }

  .car-key-btn {
    width: 40px;
    flex: 0 0 40px;
  }

  .car-row__track {
    min-height: 80px;
  }

  .car-row__name {
    font-size: clamp(12px, 4vw, 18px);
    max-width: 70%;
    margin-left: 20px;
  }

  .car-icon-wrap {
    left: -32px;
    width: 120px;
    height: 56px;
  }
}```

## src/components/garage/CarItem/CarItem.tsx
```tsx
import { useEffect, useRef, useState } from 'react';
import {
  deleteCar as deleteCarApi,
  deleteWinner,
  drive,
  startEngine,
  stopEngine,
} from '../../../api/api';
import { deleteCarThunk, setSelectedCarId } from '../../../features/garageSlice';
import {
  resetCar,
  setCarDriving,
  setCarEngineStarted,
  setCarError,
} from '../../../features/raceSlice';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import type { Car } from '../../../types/types';
import { CarIcon } from '../../common/CarIcon/CarIcon';
import './CarItem.css';

interface CarItemProps {
  car: Car;
}

const ANIMATION_PADDING_PX = 90;
const MS_IN_SECOND = 1000;
const DEFAULT_POSITION = 0;

const getTrackDistance = (trackWidth: number) => Math.max(trackWidth - ANIMATION_PADDING_PX, 0);

const calculateDuration = (distance: number, velocity: number) =>
  (distance / velocity) * MS_IN_SECOND;

export const CarItem = ({ car }: CarItemProps) => {
  const dispatch = useAppDispatch();
  const raceState = useAppSelector(state => state.race.cars[car.id]);
  const isRaceInProgress = useAppSelector(state => state.race.isRaceInProgress);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [position, setPosition] = useState(DEFAULT_POSITION);

  const isEngineStarted = raceState?.isEngineStarted ?? false;
  const isDriving = raceState?.isDriving ?? false;

  const stopAnimation = () => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setPosition(DEFAULT_POSITION);
  };

  const animateCar = (velocity: number, distance: number) => {
    const totalDistance = getTrackDistance(trackRef.current?.clientWidth ?? 0);
    const duration = calculateDuration(distance, velocity);
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setPosition(progress * totalDistance);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const handleStartEngine = async () => {
    if (isEngineStarted) {
      return;
    }

    try {
      const startResponse = await startEngine(car.id);

      dispatch(setCarEngineStarted({ id: car.id, started: true }));
      dispatch(setCarDriving({ id: car.id, isDriving: true }));

      const driveResponse = await drive(car.id);

      if (!driveResponse.success) {
        dispatch(setCarError({ id: car.id, hasError: true }));
        stopAnimation();
        return;
      }

      animateCar(startResponse.velocity, startResponse.distance);
    } catch {
      dispatch(setCarError({ id: car.id, hasError: true }));
      stopAnimation();
    }
  };

  const handleStopEngine = async () => {
    if (!isEngineStarted) {
      return;
    }

    try {
      await stopEngine(car.id);
    } finally {
      stopAnimation();
      dispatch(resetCar(car.id));
    }
  };

  const handleSelect = () => {
    dispatch(setSelectedCarId(car.id));
  };

  const handleDelete = async () => {
    if (isRaceInProgress || isDriving) {
      return;
    }

    await deleteCarApi(car.id);
    await deleteWinner(car.id);
    dispatch(deleteCarThunk(car.id));
  };

  useEffect(() => {
    if (!isDriving) {
      stopAnimation();
    }
  }, [isDriving]);

  return (
    <div className="car-row">
      <div className="car-row__controls">
        <div className="car-row__action">
          <button
            className="neon-button neon-button--mini car-action-btn"
            type="button"
            onClick={handleSelect}
          >
            Select
          </button>
          <button className="neon-button neon-button--mini car-key-btn" type="button">
            A
          </button>
        </div>

        <div className="car-row__action">
          <button
            className="neon-button neon-button--pink neon-button--mini car-action-btn"
            type="button"
            onClick={handleDelete}
            disabled={isRaceInProgress || isDriving}
          >
            Remove
          </button>
          <button
            className="neon-button neon-button--pink neon-button--mini car-key-btn"
            type="button"
          >
            B
          </button>
        </div>
      </div>

      <div className="car-row__track" ref={trackRef}>
        <div
          className="car-icon-wrap"
          style={{
            transform: `translateY(-50%) translateX(${position}px)`,
          }}
        >
          <CarIcon color={car.color} />
        </div>

        <div className="car-row__name">{car.name}</div>
      </div>
    </div>
  );
};
```

## src/components/garage/RaceControls.css
```css
.race-controls {
  padding: 16px;
}```

## src/components/garage/RaceControls.tsx
```tsx
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
```

## src/components/layout/Layout.css
```css
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app__header {
  padding: 18px 20px 8px;
}

.app__nav {
  width: 100%;
  max-width: var(--container);
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 14px;
}

.nav-link {
  min-width: 146px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  border-radius: 12px;
  border: 1px solid rgba(126, 231, 255, 0.8);
  color: var(--cyan);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: rgba(10, 16, 34, 0.7);
  box-shadow: inset 0 0 0 1px rgba(126, 231, 255, 0.12), var(--shadow-glow);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.nav-link:last-child {
  border-color: rgba(255, 122, 217, 0.8);
  color: var(--pink);
  box-shadow: inset 0 0 0 1px rgba(255, 122, 217, 0.12), 0 0 12px rgba(255, 122, 217, 0.35);
}

.nav-link:hover {
  transform: translateY(-1px);
}

.nav-link--active {
  background: rgba(126, 231, 255, 0.1);
}

.app__main {
  width: 100%;
  max-width: var(--container);
  margin: 0 auto;
  padding: 10px 20px 28px;
  flex: 1;
}

@media (max-width: 600px) {
  .app__header,
  .app__main {
    padding-left: 12px;
    padding-right: 12px;
  }

  .app__nav {
    flex-wrap: wrap;
  }

  .nav-link {
    flex: 1 1 calc(50% - 7px);
    min-width: 0;
  }
}```

## src/components/layout/Layout.tsx
```tsx
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const getLinkClassName = (path: string) =>
    location.pathname === path ? 'nav-link nav-link--active' : 'nav-link';

  return (
    <div className="app">
      <header className="app__header">
        <nav className="app__nav">
          <Link to="/garage" className={getLinkClassName('/garage')}>
            Garage
          </Link>
          <Link to="/winners" className={getLinkClassName('/winners')}>
            Winners
          </Link>
        </nav>
      </header>

      <main className="app__main">{children}</main>
    </div>
  );
};
```

## src/features/garageSlice.ts
```ts
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Car, PaginatedResponse } from '../types/types';
import { createCar, deleteCar, getCars, updateCar } from '../api/api';

interface GarageState {
  cars: Car[];
  totalCount: number;
  page: number;
  isLoading: boolean;
  error: string | null;
  selectedCarId: number | null;
  isCreatingRandom: boolean;
}

const INITIAL_PAGE = 1;

const initialState: GarageState = {
  cars: [],
  totalCount: 0,
  page: INITIAL_PAGE,
  isLoading: false,
  error: null,
  selectedCarId: null,
  isCreatingRandom: false,
};

export const fetchCars = createAsyncThunk<PaginatedResponse<Car>, number, { rejectValue: string }>(
  'garage/fetchCars',
  async (page, { rejectWithValue }) => {
    try {
      return await getCars(page);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const createCarThunk = createAsyncThunk<Car, Omit<Car, 'id'>, { rejectValue: string }>(
  'garage/createCar',
  async (car, { rejectWithValue }) => {
    try {
      return await createCar(car);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const updateCarThunk = createAsyncThunk<
  Car,
  { id: number; car: Omit<Car, 'id'> },
  { rejectValue: string }
>('garage/updateCar', async ({ id, car }, { rejectWithValue }) => {
  try {
    return await updateCar(id, car);
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

export const deleteCarThunk = createAsyncThunk<number, number, { rejectValue: string }>(
  'garage/deleteCar',
  async (id, { rejectWithValue }) => {
    try {
      await deleteCar(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

const garageSlice = createSlice({
  name: 'garage',
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setSelectedCarId(state, action: PayloadAction<number | null>) {
      state.selectedCarId = action.payload;
    },
    setIsCreatingRandom(state, action: PayloadAction<boolean>) {
      state.isCreatingRandom = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCars.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCars.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cars = action.payload.items;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchCars.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch cars';
      })
      .addCase(updateCarThunk.fulfilled, (state, action) => {
        const index = state.cars.findIndex(car => car.id === action.payload.id);
        if (index !== -1) {
          state.cars[index] = action.payload;
        }
      })
      .addCase(deleteCarThunk.fulfilled, (state, action) => {
        state.cars = state.cars.filter(car => car.id !== action.payload);
        state.totalCount -= 1;

        if (state.cars.length === 0 && state.page > 1) {
          state.page -= 1;
        }
      });
  },
});

export const { setPage, setSelectedCarId, setIsCreatingRandom } = garageSlice.actions;

export default garageSlice.reducer;
```

## src/features/raceSlice.ts
```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface CarRaceState {
  isEngineStarted: boolean;
  isDriving: boolean;
  isFinished: boolean;
  hasError: boolean;
}

interface RaceState {
  cars: Record<number, CarRaceState>;
  isRaceInProgress: boolean;
  winnerId: number | null;
  winnerTime: number | null;
}

const initialState: RaceState = {
  cars: {},
  isRaceInProgress: false,
  winnerId: null,
  winnerTime: null,
};

const raceSlice = createSlice({
  name: 'race',
  initialState,
  reducers: {
    setCarEngineStarted(state, action: PayloadAction<{ id: number; started: boolean }>) {
      const { id, started } = action.payload;
      const current = state.cars[id] ?? {
        isEngineStarted: false,
        isDriving: false,
        isFinished: false,
        hasError: false,
      };

      state.cars[id] = {
        ...current,
        isEngineStarted: started,
      };
    },
    setCarDriving(state, action: PayloadAction<{ id: number; isDriving: boolean }>) {
      const { id, isDriving } = action.payload;
      const current = state.cars[id] ?? {
        isEngineStarted: false,
        isDriving: false,
        isFinished: false,
        hasError: false,
      };

      state.cars[id] = {
        ...current,
        isDriving,
      };
    },
    setCarFinished(state, action: PayloadAction<{ id: number; time: number }>) {
      const { id, time } = action.payload;
      const current = state.cars[id] ?? {
        isEngineStarted: false,
        isDriving: false,
        isFinished: false,
        hasError: false,
      };

      state.cars[id] = {
        ...current,
        isFinished: true,
        isDriving: false,
      };

      if (!state.winnerId || (state.winnerTime && time < state.winnerTime)) {
        state.winnerId = id;
        state.winnerTime = time;
      }
    },
    setCarError(state, action: PayloadAction<{ id: number; hasError: boolean }>) {
      const { id, hasError } = action.payload;
      const current = state.cars[id] ?? {
        isEngineStarted: false,
        isDriving: false,
        isFinished: false,
        hasError: false,
      };

      state.cars[id] = {
        ...current,
        hasError,
        isDriving: false,
      };
    },
    resetCar(state, action: PayloadAction<number>) {
      const id = action.payload;
      state.cars[id] = {
        isEngineStarted: false,
        isDriving: false,
        isFinished: false,
        hasError: false,
      };
    },
    resetRaceState(state) {
      state.cars = {};
      state.isRaceInProgress = false;
      state.winnerId = null;
      state.winnerTime = null;
    },
    setRaceInProgress(state, action: PayloadAction<boolean>) {
      state.isRaceInProgress = action.payload;
    },
  },
});

export const {
  setCarEngineStarted,
  setCarDriving,
  setCarFinished,
  setCarError,
  resetCar,
  resetRaceState,
  setRaceInProgress,
} = raceSlice.actions;

export default raceSlice.reducer;
```

## src/features/winnersSlice.ts
```ts
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PaginatedResponse, SortField, SortOrder, Winner } from '../types/types';
import { createWinner, getWinner, getWinners, updateWinner } from '../api/api';

interface WinnersState {
  winners: Winner[];
  totalCount: number;
  page: number;
  sort: SortField | null;
  order: SortOrder | null;
  isLoading: boolean;
  error: string | null;
}

const INITIAL_PAGE = 1;

const initialState: WinnersState = {
  winners: [],
  totalCount: 0,
  page: INITIAL_PAGE,
  sort: 'id',
  order: 'ASC',
  isLoading: false,
  error: null,
};

export const fetchWinners = createAsyncThunk<
  PaginatedResponse<Winner>,
  void,
  { state: { winners: WinnersState }; rejectValue: string }
>('winners/fetchWinners', async (_, { getState, rejectWithValue }) => {
  const { page, sort, order } = getState().winners;
  try {
    return await getWinners(page, sort, order);
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

export const upsertWinner = createAsyncThunk<
  Winner,
  { id: number; time: number },
  { rejectValue: string }
>('winners/upsertWinner', async ({ id, time }, { rejectWithValue }) => {
  try {
    const existing = await getWinner(id);

    if (!existing) {
      const created = await createWinner({ id, wins: 1, time });
      return created;
    }

    const updated: Winner = {
      id,
      wins: existing.wins + 1,
      time: time < existing.time ? time : existing.time,
    };

    const result = await updateWinner(updated);
    return result;
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

const winnersSlice = createSlice({
  name: 'winners',
  initialState,
  reducers: {
    setWinnersPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setSort(state, action: PayloadAction<SortField>) {
      if (state.sort === action.payload) {
        state.order = state.order === 'ASC' ? 'DESC' : 'ASC';
      } else {
        state.sort = action.payload;
        state.order = 'ASC';
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchWinners.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWinners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.winners = action.payload.items;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchWinners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch winners';
      })
      .addCase(upsertWinner.fulfilled, () => {});
  },
});

export const { setWinnersPage, setSort } = winnersSlice.actions;

export default winnersSlice.reducer;
```

## src/helpers/animation.ts
```ts
const MS_IN_SECOND = 1000;
const DEFAULT_ANIMATION_PADDING_PX = 90;

export const calcAnimationDuration = (velocity: number, distance: number): number =>
  (distance / velocity) * MS_IN_SECOND;

export const calcRaceTimeSeconds = (velocity: number, distance: number): number =>
  distance / velocity;

export const calcTrackDistance = (trackWidth: number): number =>
  Math.max(trackWidth - DEFAULT_ANIMATION_PADDING_PX, 0);

export { DEFAULT_ANIMATION_PADDING_PX, MS_IN_SECOND };
```

## src/helpers/carValidation.ts
```ts
const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 20;

export const isValidCarName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length >= MIN_NAME_LENGTH && trimmed.length <= MAX_NAME_LENGTH;
};

export const normalizeCarName = (name: string): string => name.trim();

export { MAX_NAME_LENGTH, MIN_NAME_LENGTH };
```

## src/helpers/race.ts
```ts
import { generateRandomCars } from './randomCar';

const RANDOM_CARS_COUNT = 100;
const MILLISECONDS_IN_SECOND = 1000;

export const createRandomCarsPayload = () => generateRandomCars(RANDOM_CARS_COUNT);

export const convertMillisecondsToSeconds = (value: number): number =>
  value / MILLISECONDS_IN_SECOND;
```

## src/helpers/randomCar.ts
```ts
import type { Car } from '../types/types';

const FIRST_PARTS = [
  'Tesla',
  'Ford',
  'BMW',
  'Audi',
  'Lexus',
  'Toyota',
  'Nissan',
  'Honda',
  'Kia',
  'Mazda',
];

const SECOND_PARTS = [
  'Model S',
  'Mustang',
  'M3',
  'A6',
  'RX',
  'Supra',
  'Skyline',
  'Civic',
  'Sportage',
  'CX-5',
];

const HEX_RADIX = 16;
const MAX_COLOR_VALUE = 0xffffff;
const COLOR_STRING_LENGTH = 6;

const getRandomIndex = (max: number) => Math.floor(Math.random() * max);

const getRandomColor = () =>
  `#${Math.floor(Math.random() * MAX_COLOR_VALUE)
    .toString(HEX_RADIX)
    .padStart(COLOR_STRING_LENGTH, '0')}`;

export const getRandomCarData = (): Omit<Car, 'id'> => {
  const first = FIRST_PARTS[getRandomIndex(FIRST_PARTS.length)];
  const second = SECOND_PARTS[getRandomIndex(SECOND_PARTS.length)];

  return {
    name: `${first} ${second}`,
    color: getRandomColor(),
  };
};

export const generateRandomCars = (count: number): Omit<Car, 'id'>[] =>
  Array.from({ length: count }, () => getRandomCarData());
```

## src/hooks.ts
```ts
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './app/store';

export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

## src/main.tsx
```tsx
import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { store } from './app/store';
import App from './App';
import './styles/index.css';
import './styles/button.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
```

## src/pages/GaragePage/GaragePage.css
```css
.garage-layout {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.garage-track {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  --track-start: 282px;
  --track-end: 10px;
  --track-start-label: 272px;
  --track-label-z: 3;
}

.garage-track::before,
.garage-track::after {
  content: '';
  position: absolute;
  top: 16px;
  bottom: 16px;
  width: 2px;
  z-index: 2;
  pointer-events: none;
}

.garage-track::before {
  left: var(--track-start);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.55);
}

.garage-track::after {
  right: var(--track-end);
  background: rgba(123, 255, 154, 0.95);
  box-shadow: 0 0 8px rgba(123, 255, 154, 0.55);
}

.garage-track-label-start,
.garage-track-label-finish {
  position: absolute;
  top: 50%;
  transform: translateY(-50%) rotate(+90deg);
  font-family: var(--font-display);
  font-size: 14px;
  letter-spacing: 0.14em;
  z-index: var(--track-label-z);
  pointer-events: none;
  white-space: nowrap;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.6);
}

.garage-track-label-start {
  left: var(--track-start-label);
  color: var(--pink);
}

.garage-track-label-finish {
  right: -4px;
  color: var(--green);
}

.track-header,
.track-footer {
  height: 16px;
  border-top: 2px solid rgba(255, 255, 255, 0.75);
  border-bottom: 2px solid rgba(255, 255, 255, 0.75);
  background:
    repeating-linear-gradient(
      90deg,
      transparent 0 10px,
      rgba(255, 178, 77, 0.95) 10px 20px,
      transparent 20px 30px,
      rgba(255, 255, 255, 0.9) 30px 40px
    );
  opacity: 0.95;
}

.garage-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.garage-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.garage-counter {
  font-family: var(--font-display);
  font-size: 28px;
  letter-spacing: 0.08em;
  color: var(--cyan);
  text-transform: uppercase;
}

.garage-counter span {
  color: var(--pink);
}

.garage-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 600px) {
  .garage-track {
    --track-start: 72px;
    --track-start-label: 46px;
  }

  .garage-track-label-start,
  .garage-track-label-finish {
    font-size: 11px;
    --track-label-z: 5;
    margin-top: 20px;
  }

  .garage-track-label-start {
    left: 65px;
  }

  .garage-track-label-finish {
    right: -20px;
  }

  .garage-bottom {
    align-items: flex-start;
  }

  .garage-pagination {
    width: 100%;
    justify-content: flex-end;
  }
}```

## src/pages/GaragePage/GaragePage.tsx
```tsx
import { useEffect } from 'react';
import { fetchCars, setPage } from '../../features/garageSlice';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { CarForm } from '../../components/garage/CarForm/CarForm';
import { CarItem } from '../../components/garage/CarItem/CarItem';
import { Pagination } from '../../components/common/Pagination/Pagination';
import { RaceControls } from '../../components/garage/RaceControls';
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
```

## src/pages/WinnersPage/WinnersPage.css
```css
```

## src/pages/WinnersPage/WinnersPage.tsx
```tsx
export const WinnersPage = () => {
  return <section className="page" />;
};
```

## src/styles/button.css
```css
.neon-button {
  min-height: 38px;
  padding: 0 16px;
  border-radius: 11px;
  border: var(--border-neon);
  background: rgba(9, 14, 31, 0.72);
  color: var(--cyan);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  box-shadow: inset 0 0 0 1px rgba(126, 231, 255, 0.08);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease,
    border-color 0.2s ease;
}

.neon-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 0 16px rgba(126, 231, 255, 0.25);
}

.neon-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.neon-button--pink {
  border-color: var(--border-pink);
  color: var(--pink);
}

.neon-button--green {
  border-color: var(--border-green);
  color: var(--green);
}

.neon-button--orange {
  border-color: var(--border-orange);
  color: var(--orange);
}

.neon-button--small {
  min-width: 170px;
  justify-content: center;
}

.neon-button--mini {
  min-width: 44px;
  padding-inline: 12px;
}

.button-icon {
  margin-right: 8px;
}```

## src/styles/index.css
```css

:root {
  --bg: #0b1020;
  --bg-panel: rgba(9, 14, 31, 0.78);
  --bg-panel-solid: #121a33;
  --bg-line: rgba(255, 255, 255, 0.08);
  --text: #dde6ff;
  --text-muted: #8f9bbd;
  --text-soft: #b8c2e0;
  --cyan: #7ee7ff;
  --pink: #ff7ad9;
  --green: #7bff9a;
  --orange: #ffb24d;
  --red: #ff6b81;
  --shadow-glow: 0 0 12px rgba(126, 231, 255, 0.45), 0 0 26px rgba(255, 122, 217, 0.22);
  --shadow-panel: 0 16px 40px rgba(0, 0, 0, 0.35);
  --border-neon: 1px solid rgba(126, 231, 255, 0.75);
  --border-pink: 1px solid rgba(255, 122, 217, 0.78);
  --border-green: 1px solid rgba(123, 255, 154, 0.82);
  --border-orange: 1px solid rgba(255, 178, 77, 0.82);
  --radius-lg: 18px;
  --radius-md: 12px;
  --radius-sm: 8px;
  --container: 1180px;
  --font-main: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-display: 'Trebuchet MS', 'Segoe UI', sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  min-height: 100%;
}

body {
  margin: 0;
  font-family: var(--font-main);
  color: var(--text);
  background:
    radial-gradient(circle at top, rgba(99, 102, 241, 0.18), transparent 35%),
    radial-gradient(circle at 80% 15%, rgba(255, 122, 217, 0.13), transparent 28%),
    linear-gradient(180deg, #070b16 0%, #0b1020 32%, #080d1a 100%);
  background-attachment: fixed;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}

#root {
  width: 100%;
}

.page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.page__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text);
  text-shadow: 0 0 14px rgba(126, 231, 255, 0.15);
}

.panel {
  background: linear-gradient(180deg, rgba(18, 26, 51, 0.9), rgba(8, 13, 26, 0.85));
  border: 1px solid rgba(126, 231, 255, 0.18);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-panel);
}

.section-label {
  margin: 0;
  color: var(--text-soft);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 13px;
}

.section-label--ghost {
  opacity: 0;
  position: absolute;
  pointer-events: none;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  padding: 16px;
}

.controls__group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.empty-state {
  padding: 28px 16px;
  text-align: center;
  color: var(--text-muted);
  border-radius: var(--radius-lg);
  border: 1px dashed rgba(126, 231, 255, 0.25);
  background: rgba(18, 26, 51, 0.45);
}

@media (max-width: 900px) {
  .page__title {
    font-size: 36px;
  }
}

@media (max-width: 600px) {
  .controls {
    padding: 12px;
  }

  .controls__group {
    width: 100%;
  }
}```

## src/styles/main.css
```css
:root {
  --bg: #0b1020;
  --bg-panel: rgba(9, 14, 31, 0.78);
  --bg-panel-solid: #121a33;
  --bg-line: rgba(255, 255, 255, 0.08);
  --text: #dde6ff;
  --text-muted: #8f9bbd;
  --text-soft: #b8c2e0;
  --cyan: #7ee7ff;
  --pink: #ff7ad9;
  --green: #7bff9a;
  --orange: #ffb24d;
  --red: #ff6b81;
  --shadow-glow: 0 0 12px rgba(126, 231, 255, 0.45), 0 0 26px rgba(255, 122, 217, 0.22);
  --shadow-panel: 0 16px 40px rgba(0, 0, 0, 0.35);
  --border-neon: 1px solid rgba(126, 231, 255, 0.75);
  --border-pink: 1px solid rgba(255, 122, 217, 0.78);
  --border-green: 1px solid rgba(123, 255, 154, 0.82);
  --border-orange: 1px solid rgba(255, 178, 77, 0.82);
  --radius-lg: 18px;
  --radius-md: 12px;
  --radius-sm: 8px;
  --container: 1180px;
  --font-main: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-display: 'Trebuchet MS', 'Segoe UI', sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  min-height: 100%;
}

body {
  margin: 0;
  font-family: var(--font-main);
  color: var(--text);
  background:
    radial-gradient(circle at top, rgba(99, 102, 241, 0.18), transparent 35%),
    radial-gradient(circle at 80% 15%, rgba(255, 122, 217, 0.13), transparent 28%),
    linear-gradient(180deg, #070b16 0%, #0b1020 32%, #080d1a 100%);
  background-attachment: fixed;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}

#root {
  width: 100%;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app__header {
  padding: 18px 20px 8px;
}

.app__nav {
  width: 100%;
  max-width: var(--container);
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 14px;
}

.nav-link {
  min-width: 146px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  border-radius: 12px;
  border: 1px solid rgba(126, 231, 255, 0.8);
  color: var(--cyan);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: rgba(10, 16, 34, 0.7);
  box-shadow: inset 0 0 0 1px rgba(126, 231, 255, 0.12), var(--shadow-glow);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.nav-link:last-child {
  border-color: rgba(255, 122, 217, 0.8);
  color: var(--pink);
  box-shadow: inset 0 0 0 1px rgba(255, 122, 217, 0.12), 0 0 12px rgba(255, 122, 217, 0.35);
}

.nav-link:hover {
  transform: translateY(-1px);
}

.nav-link--active {
  background: rgba(126, 231, 255, 0.1);
}

.app__main {
  width: 100%;
  max-width: var(--container);
  margin: 0 auto;
  padding: 10px 20px 28px;
  flex: 1;
}

.page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.page__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text);
  text-shadow: 0 0 14px rgba(126, 231, 255, 0.15);
}

.panel {
  background: linear-gradient(180deg, rgba(18, 26, 51, 0.9), rgba(8, 13, 26, 0.85));
  border: 1px solid rgba(126, 231, 255, 0.18);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-panel);
}

.section-label {
  margin: 0;
  color: var(--text-soft);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 13px;
}

.section-label--ghost {
  opacity: 0;
  position: absolute;
  pointer-events: none;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  padding: 16px;
}

.controls__group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.neon-button {
  min-height: 38px;
  padding: 0 16px;
  border-radius: 11px;
  border: var(--border-neon);
  background: rgba(9, 14, 31, 0.72);
  color: var(--cyan);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  box-shadow: inset 0 0 0 1px rgba(126, 231, 255, 0.08);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease,
    border-color 0.2s ease;
}

.neon-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 0 16px rgba(126, 231, 255, 0.25);
}

.neon-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.neon-button--pink {
  border-color: var(--border-pink);
  color: var(--pink);
}

.neon-button--green {
  border-color: var(--border-green);
  color: var(--green);
}

.neon-button--orange {
  border-color: var(--border-orange);
  color: var(--orange);
}

.neon-button--small {
  min-width: 170px;
  justify-content: center;
}

.neon-button--mini {
  min-width: 44px;
  padding-inline: 12px;
}

.button-icon {
  margin-right: 8px;
}

.neon-input {
  min-height: 38px;
  min-width: 220px;
  padding: 0 14px;
  border-radius: 11px;
  border: 1px solid rgba(126, 231, 255, 0.45);
  background: rgba(243, 246, 255, 0.96);
  color: #111827;
  outline: none;
}

.neon-input:focus {
  border-color: rgba(123, 255, 154, 0.9);
  box-shadow: 0 0 0 3px rgba(123, 255, 154, 0.18);
}

.neon-color {
  width: 38px;
  height: 38px;
  padding: 0;
  border: 2px solid rgba(255, 255, 255, 0.55);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}

.neon-color::-webkit-color-swatch-wrapper {
  padding: 0;
}

.neon-color::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
}

.garage-layout {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.garage-track {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.garage-track::before,
.garage-track::after {
  content: '';
  position: absolute;
  top: 16px;
  bottom: 16px;
  width: 2px;
  z-index: 2;
  pointer-events: none;
}

.garage-track::before {
  left: 282px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.55);
}

.garage-track::after {
  right: 30px;
  background: rgba(123, 255, 154, 0.95);
  box-shadow: 0 0 8px rgba(123, 255, 154, 0.55);
}

.garage-track-label-start,
.garage-track-label-finish {
  position: absolute;
  top: 50%;
  transform: translateY(-50%) rotate(+90deg);
  font-family: var(--font-display);
  font-size: 14px;
  letter-spacing: 0.14em;
  z-index: 3;
  pointer-events: none;
  white-space: nowrap;
}

.garage-track-label-start {
  left: 272px;
  color: var(--pink);
}

.garage-track-label-finish {
  right: -4px;
  color: var(--green);
}

.track-header,
.track-footer {
  height: 16px;
  border-top: 2px solid rgba(255, 255, 255, 0.75);
  border-bottom: 2px solid rgba(255, 255, 255, 0.75);
  background:
    repeating-linear-gradient(
      90deg,
      transparent 0 10px,
      rgba(255, 178, 77, 0.95) 10px 20px,
      transparent 20px 30px,
      rgba(255, 255, 255, 0.9) 30px 40px
    );
  opacity: 0.95;
}

.garage-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.car-row {
  display: grid;
  grid-template-columns: 210px 1fr;
  min-height: 92px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.car-row:first-child {
  border-top: none;
}

.car-row__controls {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 10px 12px 10px 0;
}

.car-row__action {
  display: flex;
  align-items: center;
  gap: 8px;
}

.car-action-btn {
  width: 116px;
  justify-content: center;
}

.car-key-btn {
  width: 44px;
  justify-content: center;
  padding-inline: 0;
}

.car-row__track {
  position: relative;
  min-height: 92px;
  overflow: hidden;
}

.car-row__track::before,
.car-row__track::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  z-index: 1;
}

.car-row__track::before {
  left: 72px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.55);
}

.car-row__track::after {
  right: 10px;
  background: rgba(123, 255, 154, 0.95);
  box-shadow: 0 0 8px rgba(123, 255, 154, 0.55);
}

.car-row__name {
  position: absolute;
  left: 46%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--font-display);
  font-size: 24px;
  letter-spacing: 0.05em;
  color: var(--text-soft);
  text-transform: uppercase;
  white-space: nowrap;
  pointer-events: none;
}

.car-icon-wrap {
  position: absolute;
  left: -42px;
  top: 50%;
  width: 160px;
  height: 72px;
  z-index: 2;
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.15))
    drop-shadow(0 0 2px currentColor);
}

.car-icon {
  width: 100%;
  height: 100%;
  display: block;
}

.garage-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.garage-counter {
  font-family: var(--font-display);
  font-size: 28px;
  letter-spacing: 0.08em;
  color: var(--cyan);
  text-transform: uppercase;
}

.garage-counter span {
  color: var(--pink);
}

.garage-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.winner-banner {
  padding: 14px 16px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(123, 255, 154, 0.8);
  background: rgba(9, 14, 31, 0.86);
  color: var(--green);
  box-shadow: 0 0 22px rgba(123, 255, 154, 0.14);
}

.empty-state {
  padding: 28px 16px;
  text-align: center;
  color: var(--text-muted);
  border-radius: var(--radius-lg);
  border: 1px dashed rgba(126, 231, 255, 0.25);
  background: rgba(18, 26, 51, 0.45);
}

@media (max-width: 900px) {
  .page__title {
    font-size: 36px;
  }

  .neon-input {
    min-width: 180px;
    flex: 1 1 180px;
  }

  .car-row__name {
    font-size: 20px;
  }
}

@media (max-width: 600px) {
  .app__header,
  .app__main {
    padding-left: 12px;
    padding-right: 12px;
  }

  .app__nav {
    flex-wrap: wrap;
  }

  .nav-link {
    flex: 1 1 calc(50% - 7px);
    min-width: 0;
  }

  .controls {
    padding: 12px;
  }

  .controls__group {
    width: 100%;
  }

  .neon-input {
    width: 100%;
    min-width: 0;
  }

  .garage-bottom {
    align-items: flex-start;
  }

  .garage-pagination {
    width: 100%;
    justify-content: flex-end;
  }

  .car-action-btn {
    width: 108px;
  }
}```

## src/types/types.ts
```ts
export interface Car {
  id: number;
  name: string;
  color: string;
}

export interface EngineStartStopResponse {
  velocity: number;
  distance: number;
}

export interface Winner {
  id: number;
  wins: number;
  time: number;
}

export interface WinnerWithCar extends Winner {
  car: Car;
}

export type SortField = 'id' | 'wins' | 'time';
export type SortOrder = 'ASC' | 'DESC';

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
}
```

