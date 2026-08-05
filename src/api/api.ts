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
