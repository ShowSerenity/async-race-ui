import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  createCarThunk,
  fetchCars,
  setSelectedCarId,
  updateCarThunk,
} from '../../../features/garageSlice';
import { isValidCarName, normalizeCarName, MAX_NAME_LENGTH } from '../../../helpers/carValidation';
import './CarForm.css';

const DEFAULT_COLOR = '#000000';

export const CarForm = () => {
  const dispatch = useAppDispatch();
  const { cars, selectedCarId, page } = useAppSelector(state => state.garage);

  const [createName, setCreateName] = useState('');
  const [createColor, setCreateColor] = useState(DEFAULT_COLOR);
  const [updateName, setUpdateName] = useState('');
  const [updateColor, setUpdateColor] = useState(DEFAULT_COLOR);

  useEffect(() => {
    if (!selectedCarId) {
      setUpdateName('');
      setUpdateColor(DEFAULT_COLOR);
      return;
    }

    const selectedCar = cars.find(car => car.id === selectedCarId);

    if (selectedCar) {
      setUpdateName(selectedCar.name);
      setUpdateColor(selectedCar.color);
    }
  }, [cars, selectedCarId]);

  const refreshPageCars = async () => {
    await dispatch(fetchCars(page));
  };

  const handleCreate = async () => {
    if (!isValidCarName(createName)) {
      return;
    }

    await dispatch(
      createCarThunk({
        name: normalizeCarName(createName),
        color: createColor,
      }),
    );

    setCreateName('');
    setCreateColor(DEFAULT_COLOR);
    await refreshPageCars();
  };

  const handleUpdate = async () => {
    if (!selectedCarId || !isValidCarName(updateName)) {
      return;
    }

    await dispatch(
      updateCarThunk({
        id: selectedCarId,
        car: {
          name: normalizeCarName(updateName),
          color: updateColor,
        },
      }),
    );

    dispatch(setSelectedCarId(null));
    setUpdateName('');
    setUpdateColor(DEFAULT_COLOR);
    await refreshPageCars();
  };

  return (
    <section className="controls panel">
      <div className="controls__group">
        <input
          className="neon-input"
          type="text"
          value={createName}
          onChange={event => setCreateName(event.target.value)}
          placeholder="Type car brand"
          maxLength={MAX_NAME_LENGTH}
        />
        <input
          className="neon-color"
          type="color"
          value={createColor}
          onChange={event => setCreateColor(event.target.value)}
        />
        <button
          className="neon-button neon-button--pink"
          type="button"
          onClick={handleCreate}
          disabled={!isValidCarName(createName)}
        >
          Create
        </button>
      </div>

      <div className="controls__group">
        <input
          className="neon-input"
          type="text"
          value={updateName}
          onChange={event => setUpdateName(event.target.value)}
          placeholder="Type car brand"
          maxLength={MAX_NAME_LENGTH}
          disabled={!selectedCarId}
        />
        <input
          className="neon-color"
          type="color"
          value={updateColor}
          onChange={event => setUpdateColor(event.target.value)}
          disabled={!selectedCarId}
        />
        <button
          className="neon-button neon-button--pink"
          type="button"
          onClick={handleUpdate}
          disabled={!selectedCarId || !isValidCarName(updateName)}
        >
          Update
        </button>
      </div>
    </section>
  );
};
