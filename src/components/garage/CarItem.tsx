import { useEffect, useRef, useState } from 'react';
import { deleteCar, deleteWinner, drive, startEngine, stopEngine } from '../../api/api';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  deleteCarThunk,
  setSelectedCarId,
} from '../../features/garageSlice';
import {
  resetCar,
  setCarDriving,
  setCarEngineStarted,
  setCarError,
  setCarFinished,
} from '../../features/raceSlice';
import type { Car } from '../../types/types';

interface CarItemProps {
  car: Car;
}

const ANIMATION_PADDING_PX = 88;

export const CarItem = ({ car }: CarItemProps) => {
  const dispatch = useAppDispatch();
  const raceState = useAppSelector(state => state.race.cars[car.id]);
  const isRaceInProgress = useAppSelector(state => state.race.isRaceInProgress);
  const carTrackRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [position, setPosition] = useState(0);

  const isEngineStarted = raceState?.isEngineStarted ?? false;
  const isDriving = raceState?.isDriving ?? false;

  const stopAnimation = () => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setPosition(0);
  };

  const getTrackDistance = () => {
    const trackWidth = carTrackRef.current?.clientWidth ?? 0;
    return Math.max(trackWidth - ANIMATION_PADDING_PX, 0);
  };

  const startAnimation = (velocity: number, distance: number) => {
    const totalDistance = getTrackDistance();
    const duration = (distance / velocity) * 1000;
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

      startAnimation(startResponse.velocity, startResponse.distance);
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

    await deleteCar(car.id);
    await deleteWinner(car.id);
    dispatch(deleteCarThunk(car.id));
  };

  useEffect(() => {
    if (!isDriving) {
      stopAnimation();
    }
  }, [isDriving]);

  return (
    <article className="car-card">
      <div className="car-card__actions">
        <button className="neon-button" type="button" onClick={handleSelect}>
          Select
        </button>
        <button
          className="neon-button neon-button--pink"
          type="button"
          onClick={handleDelete}
          disabled={isRaceInProgress || isDriving}
        >
          Remove
        </button>
        <button
          className="neon-button neon-button--green"
          type="button"
          onClick={handleStartEngine}
          disabled={isEngineStarted}
        >
          Start
        </button>
        <button
          className="neon-button neon-button--orange"
          type="button"
          onClick={handleStopEngine}
          disabled={!isEngineStarted}
        >
          Stop
        </button>
      </div>

      <div className="car-card__track" ref={carTrackRef}>
        <div
          className="car"
          style={{
            transform: `translateY(-50%) translateX(${position}px)`,
            color: car.color,
            backgroundColor: car.color,
          }}
        >
          <div className="car__window" />
        </div>
        <div className="car-card__flag">FINISH</div>
      </div>

      <div className="car-card__name">{car.name}</div>
    </article>
  );
};