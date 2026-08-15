import { useEffect } from 'react';
import { drive, startEngine, stopEngine } from '../api/api';
import {
  clearStartRequest,
  completeCarRace,
  resetCar,
  setCarEngineStarted,
  setCarError,
  startCarAnimation,
} from '../features/raceSlice';
import { calcAnimationDuration, calcRaceTimeSeconds } from '../helpers/animation';
import { useAppDispatch, useAppSelector } from '../hooks';

/**
 * Owns the engine start/stop lifecycle for a single car: talks to the mock
 * API, drives the Redux animation state, and reacts to an externally
 * requested start (e.g. the "Race" button starting every car on the page).
 */
export const useCarEngine = (carId: number) => {
  const dispatch = useAppDispatch();
  const raceState = useAppSelector(state => state.race.cars[carId]);

  const isEngineStarted = raceState?.isEngineStarted ?? false;
  const isDriving = raceState?.isDriving ?? false;
  const startRequested = raceState?.startRequested ?? false;

  const handleStartEngine = async () => {
    if (isEngineStarted) {
      return;
    }

    // Unique per attempt — lets completeCarRace tell this attempt's
    // drive() result apart from a stale one belonging to a previous,
    // already stopped/reset attempt for the same car.
    let attemptStartedAt: number | null = null;

    try {
      const startResponse = await startEngine(carId);
      const startedAt = performance.now();
      attemptStartedAt = startedAt;

      const durationMs = calcAnimationDuration(startResponse.velocity, startResponse.distance);
      const raceTimeSeconds = calcRaceTimeSeconds(startResponse.velocity, startResponse.distance);

      dispatch(setCarEngineStarted({ id: carId, started: true }));
      dispatch(startCarAnimation({ id: carId, startedAt, durationMs }));

      const driveResponse = await drive(carId);
      const elapsed = performance.now() - startedAt;
      const progress = Math.min(Math.max(elapsed / durationMs, 0), 1);

      dispatch(
        completeCarRace({
          id: carId,
          success: driveResponse.success,
          time: raceTimeSeconds,
          progress,
          startedAt,
        }),
      );
    } catch {
      if (attemptStartedAt !== null) {
        dispatch(
          completeCarRace({
            id: carId,
            success: false,
            time: 0,
            progress: 0,
            startedAt: attemptStartedAt,
          }),
        );
        return;
      }

      // startEngine() itself failed before any attempt was registered —
      // there's nothing to compare against, and no animation was ever
      // started for this attempt, so it's safe to just flag the error.
      dispatch(setCarError({ id: carId, progress: 0 }));
    }
  };

  // Resets the Redux state FIRST, synchronously — this immediately closes
  // the window for a still-pending drive() request to be accepted by
  // completeCarRace (isEngineStarted becomes false right away, and any new
  // attempt gets a fresh startedAt anyway). The actual stopEngine call is
  // fired afterwards, in the background, without blocking the visual/
  // logical stop on its network latency.
  const handleStopEngine = () => {
    if (!isEngineStarted) {
      return;
    }

    dispatch(resetCar(carId));
    stopEngine(carId).catch(() => {});
  };

  useEffect(() => {
    if (startRequested) {
      dispatch(clearStartRequest(carId));
      handleStartEngine();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startRequested]);

  return { isEngineStarted, isDriving, handleStartEngine, handleStopEngine };
};