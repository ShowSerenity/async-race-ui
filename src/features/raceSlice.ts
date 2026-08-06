import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../app/store';
import { upsertWinner } from './winnersSlice';

interface CarRaceState {
  isEngineStarted: boolean;
  isDriving: boolean;
  isFinished: boolean;
  hasError: boolean;
  startRequested: boolean;
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
}

const EMPTY_CAR_STATE: CarRaceState = {
  isEngineStarted: false,
  isDriving: false,
  isFinished: false,
  hasError: false,
  startRequested: false,
};

const initialState: RaceState = {
  cars: {},
  isRaceInProgress: false,
  winner: null,
};

const getCarState = (state: RaceState, id: number): CarRaceState => state.cars[id] ?? EMPTY_CAR_STATE;

export const finishRaceCar = createAsyncThunk<void, { id: number; time: number }, { state: RootState }>(
  'race/finishRaceCar',
  (payload, { getState, dispatch }) => {
    const { race, garage } = getState();

    if (!race.isRaceInProgress || race.winner) {
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
    setCarDriving(state, action: PayloadAction<{ id: number; isDriving: boolean }>) {
      const { id, isDriving } = action.payload;
      state.cars[id] = { ...getCarState(state, id), isDriving };
    },
    setCarFinished(state, action: PayloadAction<{ id: number }>) {
      const { id } = action.payload;
      state.cars[id] = {
        ...getCarState(state, id),
        isFinished: true,
        isDriving: false,
      };
    },
    setCarError(state, action: PayloadAction<{ id: number; hasError: boolean }>) {
      const { id, hasError } = action.payload;
      state.cars[id] = {
        ...getCarState(state, id),
        hasError,
        isDriving: false,
      };
    },
    resetCar(state, action: PayloadAction<number>) {
      state.cars[action.payload] = { ...EMPTY_CAR_STATE };
    },
    resetRaceState(state) {
      state.cars = {};
      state.isRaceInProgress = false;
      state.winner = null;
    },
    setRaceInProgress(state, action: PayloadAction<boolean>) {
      state.isRaceInProgress = action.payload;
    },
    setWinner(state, action: PayloadAction<RaceWinner>) {
      state.winner = action.payload;
    },
    clearWinner(state) {
      state.winner = null;
    },
  },
});

export const {
  requestStart,
  clearStartRequest,
  setCarEngineStarted,
  setCarDriving,
  setCarFinished,
  setCarError,
  resetCar,
  resetRaceState,
  setRaceInProgress,
  setWinner,
  clearWinner,
} = raceSlice.actions;

export default raceSlice.reducer;