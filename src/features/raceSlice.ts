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
