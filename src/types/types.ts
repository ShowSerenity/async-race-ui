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
