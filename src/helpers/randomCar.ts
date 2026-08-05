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
