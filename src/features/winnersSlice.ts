import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PaginatedResponse, SortField, SortOrder, Winner, WinnerWithCar } from '../types/types';
import { createWinner, getCar, getWinner, getWinners, updateWinner } from '../api/api';

interface WinnersState {
  winners: WinnerWithCar[];
  totalCount: number;
  page: number;
  sort: SortField;
  order: SortOrder;
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

const attachCarData = async (items: Winner[]): Promise<WinnerWithCar[]> =>
  Promise.all(
    items.map(async winner => {
      try {
        const car = await getCar(winner.id);
        return { ...winner, car };
      } catch {
        return { ...winner, car: null };
      }
    }),
  );

export const fetchWinners = createAsyncThunk<
  PaginatedResponse<WinnerWithCar>,
  void,
  { state: { winners: WinnersState }; rejectValue: string }
>('winners/fetchWinners', async (_, { getState, rejectWithValue }) => {
  const { page, sort, order } = getState().winners;

  try {
    const { items, totalCount } = await getWinners(page, sort, order);
    const withCars = await attachCarData(items);
    return { items: withCars, totalCount };
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

export const upsertWinner = createAsyncThunk<void, { id: number; time: number }, { rejectValue: string }>(
  'winners/upsertWinner',
  async ({ id, time }, { rejectWithValue }) => {
    try {
      const existing = await getWinner(id);

      if (!existing) {
        await createWinner({ id, wins: 1, time });
        return;
      }

      await updateWinner({
        id,
        wins: existing.wins + 1,
        time: time < existing.time ? time : existing.time,
      });
    } catch (error) {
      rejectWithValue((error as Error).message);
    }
  },
);

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
      });
  },
});

export const { setWinnersPage, setSort } = winnersSlice.actions;

export default winnersSlice.reducer;