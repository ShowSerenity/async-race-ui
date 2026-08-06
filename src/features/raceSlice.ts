import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../app/store';
import { upsertWinner } from './winnersSlice';

interface CarRaceState {
  isEngineStarted: boolean;
  isDriving: boolean;
  isFinished: boolean;
  hasError: boolean;
  startRequested: boolean;
  startedAt: number | null;
  durationMs: number | null;
  frozenProgress: number | null;
}

interface RaceWinner {
  id: number;
  name: string;
  time: number;
}

interface RaceState {
  cars: Record<number, CarRaceState>;
  isRaceInProgress: boolean;
  winner: RaceWinner | null;
  raceWinnerId: number | null;
}

const EMPTY_CAR_STATE: CarRaceState = {
  isEngineStarted: false,
  isDriving: false,
  isFinished: false,
  hasError: false,
  startRequested: false,
  startedAt: null,
  durationMs: null,
  frozenProgress: null,
};

const initialState: RaceState = {
  cars: {},
  isRaceInProgress: false,
  winner: null,
  raceWinnerId: null,
};

const getCarState = (state: RaceState, id: number): CarRaceState => state.cars[id] ?? EMPTY_CAR_STATE;

const raceSlice = createSlice({
  name: 'race',
  initialState,
  reducers: {
    requestStart(state, action: PayloadAction<number[]>) {
      action.payload.forEach(id => {
        state.cars[id] = {
          ...getCarState(state, id),
          startRequested: true,
          isFinished: false,
          hasError: false,
          frozenProgress: null,
        };
      });
    },
    clearStartRequest(state, action: PayloadAction<number>) {
      state.cars[action.payload] = {
        ...getCarState(state, action.payload),
        startRequested: false,
      };
    },
    setCarEngineStarted(state, action: PayloadAction<{ id: number; started: boolean }>) {
      const { id, started } = action.payload;
      state.cars[id] = { ...getCarState(state, id), isEngineStarted: started };
    },
    startCarAnimation(
      state,
      action: PayloadAction<{ id: number; startedAt: number; durationMs: number }>,
    ) {
      const { id, startedAt, durationMs } = action.payload;
      state.cars[id] = {
        ...getCarState(state, id),
        isDriving: true,
        startedAt,
        durationMs,
        frozenProgress: null,
        isFinished: false,
        hasError: false,
      };
    },
    setCarFinished(state, action: PayloadAction<{ id: number }>) {
      const { id } = action.payload;
      state.cars[id] = {
        ...getCarState(state, id),
        isFinished: true,
        isDriving: false,
        frozenProgress: 1,
      };
    },
    setCarError(state, action: PayloadAction<{ id: number; progress: number }>) {
      const { id, progress } = action.payload;
      state.cars[id] = {
        ...getCarState(state, id),
        hasError: true,
        isDriving: false,
        frozenProgress: progress,
      };
    },
    resetCar(state, action: PayloadAction<number>) {
      state.cars[action.payload] = { ...EMPTY_CAR_STATE };
    },
    resetRaceState(state) {
      state.cars = {};
      state.isRaceInProgress = false;
      state.winner = null;
      state.raceWinnerId = null;
    },
    setRaceInProgress(state, action: PayloadAction<boolean>) {
      state.isRaceInProgress = action.payload;
    },
    setWinner(state, action: PayloadAction<RaceWinner>) {
      state.winner = action.payload;
      state.raceWinnerId = action.payload.id;
    },
    clearWinner(state) {
      state.winner = null;
    },
    startNewRaceAttempt(state) {
      state.winner = null;
      state.raceWinnerId = null;
    },
  },
});

export const {
  requestStart,
  clearStartRequest,
  setCarEngineStarted,
  startCarAnimation,
  setCarFinished,
  setCarError,
  resetCar,
  resetRaceState,
  setRaceInProgress,
  setWinner,
  clearWinner,
  startNewRaceAttempt,
} = raceSlice.actions;

export const finishRaceCar = createAsyncThunk<void, { id: number; time: number }, { state: RootState }>(
  'race/finishRaceCar',
  (payload, { getState, dispatch }) => {
    const { race, garage } = getState();

    if (!race.isRaceInProgress || race.raceWinnerId !== null) {
      return;
    }

    const car = garage.cars.find(item => item.id === payload.id);

    dispatch(
      setWinner({
        id: payload.id,
        name: car?.name ?? 'Unknown car',
        time: payload.time,
      }),
    );

    dispatch(upsertWinner({ id: payload.id, time: payload.time }));
  },
);

export default raceSlice.reducer;