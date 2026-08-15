import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../app/store';
import { upsertWinner } from './winnersSlice';

export interface CarRaceState {
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

const getCarState = (state: RaceState, id: number): CarRaceState =>
  state.cars[id] ?? EMPTY_CAR_STATE;

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

export const finishRaceCar = createAsyncThunk<
  void,
  { id: number; time: number },
  { state: RootState }
>('race/finishRaceCar', (payload, { getState, dispatch }) => {
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
});

/**
 * Applies the result of a drive() request, but ONLY if it belongs to the
 * car's CURRENT attempt.
 *
 * drive() is held open by the server for the whole race duration and its
 * client-side promise cannot be cancelled. If the car was stopped and
 * restarted (or the whole race was reset and started again) while the old
 * drive() was still pending, `isEngineStarted` alone can't tell old and new
 * attempts apart — a fresh attempt sets it back to `true` too. So we also
 * compare `startedAt`, which is a fresh `performance.now()` timestamp
 * generated for every single attempt and therefore unique per attempt.
 * If it doesn't match the car's current `startedAt`, this result belongs
 * to an attempt that no longer exists and must be ignored.
 */
export const completeCarRace = createAsyncThunk<
  void,
  { id: number; success: boolean; time: number; progress: number; startedAt: number },
  { state: RootState }
>('race/completeCarRace', (payload, { getState, dispatch }) => {
  const car = getState().race.cars[payload.id];

  if (!car || !car.isEngineStarted || car.startedAt !== payload.startedAt) {
    return;
  }

  if (payload.success) {
    dispatch(setCarFinished({ id: payload.id }));
    dispatch(finishRaceCar({ id: payload.id, time: payload.time }));
    return;
  }

  dispatch(setCarError({ id: payload.id, progress: payload.progress }));
});

export default raceSlice.reducer;
