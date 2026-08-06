import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  deleteCar as deleteCarApi,
  deleteWinner,
  drive,
  startEngine,
  stopEngine,
} from '../../../api/api';
import { deleteCarThunk, setSelectedCarId } from '../../../features/garageSlice';
import {
  clearStartRequest,
  finishRaceCar,
  resetCar,
  setCarEngineStarted,
  setCarError,
  setCarFinished,
  startCarAnimation,
} from '../../../features/raceSlice';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import type { Car } from '../../../types/types';
import { calcAnimationDuration, calcRaceTimeSeconds } from '../../../helpers/animation';
import { CarIcon } from '../../common/CarIcon/CarIcon';
import './CarItem.css';

interface CarItemProps {
  car: Car;
}

interface RenderPosition {
  x: number;
  transitionMs: number;
}

const IDLE_RENDER: RenderPosition = { x: 0, transitionMs: 0 };
export const FINISH_LINE_INSET_PX = 76;

export const CarItem = ({ car }: CarItemProps) => {
  const dispatch = useAppDispatch();
  const raceState = useAppSelector(state => state.race.cars[car.id]);
  const isRaceInProgress = useAppSelector(state => state.race.isRaceInProgress);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const iconWrapRef = useRef<HTMLDivElement | null>(null);
  const [maxTranslate, setMaxTranslate] = useState(0);
  const [render, setRender] = useState<RenderPosition>(IDLE_RENDER);

  const isEngineStarted = raceState?.isEngineStarted ?? false;
  const isDriving = raceState?.isDriving ?? false;
  const startRequested = raceState?.startRequested ?? false;

  // Measures how far the car can travel so its right edge lands exactly on
  // the finish line, using the REAL rendered size of the track and the icon
  // (which changes across breakpoints via CSS), instead of a fixed magic
  // number. Re-runs on every resize, so it stays correct if the viewport
  // changes after mount (rotation, dev-tools responsive mode, etc.).
  useLayoutEffect(() => {
    const recompute = () => {
      const track = trackRef.current;
      const iconWrap = iconWrapRef.current;

      if (!track || !iconWrap) {
        return;
      }

      const trackWidth = track.clientWidth;
      const distance = trackWidth - FINISH_LINE_INSET_PX;

      setMaxTranslate(Math.max(distance, 0));
    };

    recompute();

    const resizeObserver = new ResizeObserver(recompute);
    if (trackRef.current) {
      resizeObserver.observe(trackRef.current);
    }
    window.addEventListener('resize', recompute);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', recompute);
    };
  }, []);

  useEffect(() => {
    if (raceState?.hasError && raceState.frozenProgress !== null) {
      setRender({ x: raceState.frozenProgress * maxTranslate, transitionMs: 0 });
      return undefined;
    }

    if (raceState?.isFinished) {
      setRender({ x: maxTranslate, transitionMs: 0 });
      return undefined;
    }

    if (raceState?.isDriving && raceState.startedAt !== null && raceState.durationMs !== null) {
      const elapsed = performance.now() - raceState.startedAt;
      const progress = Math.min(Math.max(elapsed / raceState.durationMs, 0), 1);
      const remaining = Math.max(raceState.durationMs - elapsed, 0);

      setRender({ x: progress * maxTranslate, transitionMs: 0 });

      const frameId = requestAnimationFrame(() => {
        setRender({ x: maxTranslate, transitionMs: remaining });
      });

      return () => cancelAnimationFrame(frameId);
    }

    setRender(IDLE_RENDER);
    return undefined;
  }, [raceState, maxTranslate]);

  const handleStartEngine = async () => {
    if (isEngineStarted) {
      return;
    }

    try {
      const startResponse = await startEngine(car.id);
      const startedAt = performance.now();
      const durationMs = calcAnimationDuration(startResponse.velocity, startResponse.distance);
      const raceTimeSeconds = calcRaceTimeSeconds(startResponse.velocity, startResponse.distance);

      dispatch(setCarEngineStarted({ id: car.id, started: true }));
      dispatch(startCarAnimation({ id: car.id, startedAt, durationMs }));

      const driveResponse = await drive(car.id);

      if (!driveResponse.success) {
        const elapsed = performance.now() - startedAt;
        const progress = Math.min(Math.max(elapsed / durationMs, 0), 1);
        dispatch(setCarError({ id: car.id, progress }));
        return;
      }

      dispatch(setCarFinished({ id: car.id }));
      dispatch(finishRaceCar({ id: car.id, time: raceTimeSeconds }));
    } catch {
      dispatch(setCarError({ id: car.id, progress: 0 }));
    }
  };

  const handleStopEngine = async () => {
    if (!isEngineStarted) {
      return;
    }

    try {
      await stopEngine(car.id);
    } finally {
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
    if (startRequested) {
      dispatch(clearStartRequest(car.id));
      handleStartEngine();
    }
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
            <i className="fa-solid fa-play" aria-hidden="true"/>
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
            <i className="fa-solid fa-stop" aria-hidden="true"/>
          </button>
        </div>
      </div>

      <div className="car-row__track" ref={trackRef}>
        <div
          className="car-icon-wrap"
          ref={iconWrapRef}
          style={{
            transform: `translateY(-50%) translateX(${render.x}px)`,
            transition: `transform ${render.transitionMs}ms linear`,
          }}
        >
          <CarIcon color={car.color} />
        </div>

        <div className="car-row__name">{car.name}</div>
      </div>
    </div>
  );
};
