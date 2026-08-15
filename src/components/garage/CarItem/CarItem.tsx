import { deleteCar as deleteCarApi, deleteWinner } from '../../../api/api';
import { deleteCarThunk, setSelectedCarId } from '../../../features/garageSlice';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { useCarEngine } from '../../../hooks/useCarEngine';
import { useCarRaceAnimation } from '../../../hooks/useCarRaceAnimation';
import type { Car } from '../../../types/types';
import { CarIcon } from '../../common/CarIcon/CarIcon';
import './CarItem.css';

interface CarItemProps {
  car: Car;
}

export const FINISH_LINE_INSET_PX = 76;

export const CarItem = ({ car }: CarItemProps) => {
  const dispatch = useAppDispatch();
  const raceState = useAppSelector(state => state.race.cars[car.id]);
  const isRaceInProgress = useAppSelector(state => state.race.isRaceInProgress);

  const { isEngineStarted, isDriving, handleStartEngine, handleStopEngine } = useCarEngine(car.id);
  const { trackRef, iconWrapRef, render } = useCarRaceAnimation(raceState, FINISH_LINE_INSET_PX);

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
            aria-label={`Start engine for ${car.name}`}
            title="Start engine"
          >
            <i className="fa-solid fa-play" aria-hidden="true" />
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
            aria-label={`Stop engine for ${car.name}`}
            title="Stop engine"
          >
            <i className="fa-solid fa-stop" aria-hidden="true" />
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