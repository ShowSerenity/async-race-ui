import { useEffect, useRef, useState } from 'react';
import {
  deleteCar as deleteCarApi,
  deleteWinner,
  drive,
  startEngine,
  stopEngine,
} from '../../../api/api';
import { deleteCarThunk, setSelectedCarId } from '../../../features/garageSlice';
import {
  resetCar,
  setCarDriving,
  setCarEngineStarted,
  setCarError,
} from '../../../features/raceSlice';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import type { Car } from '../../../types/types';
import { CarIcon } from '../../common/CarIcon/CarIcon';
import './CarItem.css';

interface CarItemProps {
  car: Car;
}

const ANIMATION_PADDING_PX = 90;
const MS_IN_SECOND = 1000;
const DEFAULT_POSITION = 0;

const getTrackDistance = (trackWidth: number) => Math.max(trackWidth - ANIMATION_PADDING_PX, 0);

const calculateDuration = (distance: number, velocity: number) =>
  (distance / velocity) * MS_IN_SECOND;

export const CarItem = ({ car }: CarItemProps) => {
  const dispatch = useAppDispatch();
  const raceState = useAppSelector(state => state.race.cars[car.id]);
  const isRaceInProgress = useAppSelector(state => state.race.isRaceInProgress);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [position, setPosition] = useState(DEFAULT_POSITION);

  const isEngineStarted = raceState?.isEngineStarted ?? false;
  const isDriving = raceState?.isDriving ?? false;

  const stopAnimation = () => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setPosition(DEFAULT_POSITION);
  };

  const animateCar = (velocity: number, distance: number) => {
    const totalDistance = getTrackDistance(trackRef.current?.clientWidth ?? 0);
    const duration = calculateDuration(distance, velocity);
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setPosition(progress * totalDistance);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const handleStartEngine = async () => {
    if (isEngineStarted) {
      return;
    }

    try {
      const startResponse = await startEngine(car.id);

      dispatch(setCarEngineStarted({ id: car.id, started: true }));
      dispatch(setCarDriving({ id: car.id, isDriving: true }));

      const driveResponse = await drive(car.id);

      if (!driveResponse.success) {
        dispatch(setCarError({ id: car.id, hasError: true }));
        stopAnimation();
        return;
      }

      animateCar(startResponse.velocity, startResponse.distance);
    } catch {
      dispatch(setCarError({ id: car.id, hasError: true }));
      stopAnimation();
    }
  };

  const handleStopEngine = async () => {
    if (!isEngineStarted) {
      return;
    }

    try {
      await stopEngine(car.id);
    } finally {
      stopAnimation();
      dispatch(resetCar(car.id));
    }
  };

  const handleSelect = () => {
    dispatch(setSelectedCarId(car.id));
  };

  const handleDelete = async () => {
    if (isRaceInProgress || isDriving) {
      return;
    }

    await deleteCarApi(car.id);
    await deleteWinner(car.id);
    dispatch(deleteCarThunk(car.id));
  };

  useEffect(() => {
    if (!isDriving) {
      stopAnimation();
    }
  }, [isDriving]);

  return (
    <div className="car-row">
      <div className="car-row__controls">
        <div className="car-row__action">
          <button
            className="neon-button neon-button--mini car-action-btn"
            type="button"
            onClick={handleSelect}
          >
            Select
          </button>
          <button className="neon-button neon-button--mini car-key-btn" type="button">
            A
          </button>
        </div>

        <div className="car-row__action">
          <button
            className="neon-button neon-button--pink neon-button--mini car-action-btn"
            type="button"
            onClick={handleDelete}
            disabled={isRaceInProgress || isDriving}
          >
            Remove
          </button>
          <button
            className="neon-button neon-button--pink neon-button--mini car-key-btn"
            type="button"
          >
            B
          </button>
        </div>
      </div>

      <div className="car-row__track" ref={trackRef}>
        <div
          className="car-icon-wrap"
          style={{
            transform: `translateY(-50%) translateX(${position}px)`,
          }}
        >
          <CarIcon color={car.color} />
        </div>

        <div className="car-row__name">{car.name}</div>
      </div>
    </div>
  );
};
