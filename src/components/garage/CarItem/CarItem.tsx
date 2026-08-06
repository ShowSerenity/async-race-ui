import { useEffect, useRef, useState } from 'react';
import { deleteCar as deleteCarApi, deleteWinner, drive, startEngine, stopEngine } from '../../../api/api';
import { deleteCarThunk, setSelectedCarId } from '../../../features/garageSlice';
import {
  clearStartRequest,
  finishRaceCar,
  resetCar,
  setCarDriving,
  setCarEngineStarted,
  setCarError,
  setCarFinished,
} from '../../../features/raceSlice';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import type { Car } from '../../../types/types';
import { calcAnimationDuration, calcRaceTimeSeconds, calcTrackDistance } from '../../../helpers/animation';
import { CarIcon } from '../../common/CarIcon/CarIcon';
import './CarItem.css';

interface CarItemProps {
  car: Car;
}

const DEFAULT_POSITION = 0;

export const CarItem = ({ car }: CarItemProps) => {
  const dispatch = useAppDispatch();
  const raceState = useAppSelector(state => state.race.cars[car.id]);
  const isRaceInProgress = useAppSelector(state => state.race.isRaceInProgress);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [position, setPosition] = useState(DEFAULT_POSITION);

  const isEngineStarted = raceState?.isEngineStarted ?? false;
  const isDriving = raceState?.isDriving ?? false;
  const startRequested = raceState?.startRequested ?? false;

  // Cancels the RAF loop. keepPosition=true freezes the car where it is
  // (engine breakdown); keepPosition=false snaps it back to the start (Stop button / full reset).
  const cancelAnimation = (keepPosition: boolean) => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (!keepPosition) {
      setPosition(DEFAULT_POSITION);
    }
  };

  // Purely visual: moves the car over `durationMs`. Does NOT decide when the
  // race is "finished" — that is decided by the drive() response, since the
  // server intentionally keeps that request pending for ~durationMs and may
  // break the engine down at a random point instead of resolving normally.
  const animateCar = (durationMs: number) => {
    const totalDistance = calcTrackDistance(trackRef.current?.clientWidth ?? 0);
    const startTime = performance.now();

    const step = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      setPosition(progress * totalDistance);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(step);
  };

  const handleStartEngine = async () => {
    if (isEngineStarted) {
      return;
    }

    try {
      const startResponse = await startEngine(car.id);
      const durationMs = calcAnimationDuration(startResponse.velocity, startResponse.distance);
      const raceTimeSeconds = calcRaceTimeSeconds(startResponse.velocity, startResponse.distance);

      dispatch(setCarEngineStarted({ id: car.id, started: true }));
      dispatch(setCarDriving({ id: car.id, isDriving: true }));

      // Start the visual animation immediately, in parallel with drive().
      animateCar(durationMs);

      const driveResponse = await drive(car.id);

      if (!driveResponse.success) {
        // Engine broke down mid-race: freeze exactly where it is.
        dispatch(setCarError({ id: car.id, hasError: true }));
        cancelAnimation(true);
        return;
      }

      dispatch(setCarFinished({ id: car.id }));
      dispatch(finishRaceCar({ id: car.id, time: raceTimeSeconds }));
    } catch {
      dispatch(setCarError({ id: car.id, hasError: true }));
      cancelAnimation(true);
    }
  };

  const handleStopEngine = async () => {
    if (!isEngineStarted) {
      return;
    }

    try {
      await stopEngine(car.id);
    } finally {
      cancelAnimation(false);
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

  // Only a FULL race reset removes the car's entry from race.cars entirely.
  // That's the one case where we snap the car back to the start line here.
  // A breakdown (hasError) keeps the entry (isDriving:false, hasError:true),
  // so it must NOT be caught by this effect.
  useEffect(() => {
    if (!raceState) {
      cancelAnimation(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceState === undefined]);

  useEffect(() => {
    if (startRequested) {
      dispatch(clearStartRequest(car.id));
      void handleStartEngine();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startRequested]);

  return (
    <div className="car-row">
      <div className="car-row__controls">
        <div className="car-row__action">
          <button
            className="neon-button neon-button--mini car-action-btn"
            type="button"
            onClick={handleSelect}
            disabled={isRaceInProgress || isDriving}
          >
            Select
          </button>
          <button
            className="neon-button neon-button--mini car-key-btn"
            type="button"
            onClick={handleStartEngine}
            disabled={isEngineStarted}
            title="Start engine"
          >
            <i className="fa-solid fa-play" />
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
            onClick={handleStopEngine}
            disabled={!isEngineStarted}
            title="Stop engine"
          >
            <i className="fa-solid fa-stop" />
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