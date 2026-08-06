const MS_IN_SECOND = 1000;
const DEFAULT_ANIMATION_PADDING_PX = 90;

export const calcAnimationDuration = (velocity: number, distance: number): number =>
  distance / velocity;

export const calcRaceTimeSeconds = (velocity: number, distance: number): number =>
  calcAnimationDuration(velocity, distance) / MS_IN_SECOND;

export const calcTrackDistance = (trackWidth: number): number =>
  Math.max(trackWidth - DEFAULT_ANIMATION_PADDING_PX, 0);

export { DEFAULT_ANIMATION_PADDING_PX, MS_IN_SECOND };
