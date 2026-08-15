import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CarRaceState } from '../features/raceSlice';

interface RenderPosition {
  x: number;
  transitionMs: number;
}

const IDLE_RENDER: RenderPosition = { x: 0, transitionMs: 0 };

/**
 * Purely visual: turns the car's race state (idle / driving / finished /
 * broken down) into a pixel position + transition duration, and keeps the
 * travel distance in sync with the track's real rendered width so the car
 * always stops exactly on the finish line, on any screen size.
 */
export const useCarRaceAnimation = (raceState: CarRaceState | undefined, finishLineInsetPx: number) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const iconWrapRef = useRef<HTMLDivElement | null>(null);
  const [maxTranslate, setMaxTranslate] = useState(0);
  const [render, setRender] = useState<RenderPosition>(IDLE_RENDER);

  useLayoutEffect(() => {
    const recompute = () => {
      const track = trackRef.current;
      const iconWrap = iconWrapRef.current;

      if (!track || !iconWrap) {
        return;
      }

      const distance = track.clientWidth - finishLineInsetPx;
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
  }, [finishLineInsetPx]);

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

  return { trackRef, iconWrapRef, render };
};