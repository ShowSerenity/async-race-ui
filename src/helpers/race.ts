import { generateRandomCars } from './randomCar';

const RANDOM_CARS_COUNT = 100;
const MILLISECONDS_IN_SECOND = 1000;

export const createRandomCarsPayload = () => generateRandomCars(RANDOM_CARS_COUNT);

export const convertMillisecondsToSeconds = (value: number): number =>
  value / MILLISECONDS_IN_SECOND;
