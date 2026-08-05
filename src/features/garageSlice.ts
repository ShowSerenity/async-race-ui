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
