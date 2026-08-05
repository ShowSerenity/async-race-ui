import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { createCarThunk, fetchCars, setSelectedCarId, updateCarThunk } from '../../features/garageSlice';

const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 20;

export const CarForm = () => {
  const dispatch = useAppDispatch();
  const { cars, selectedCarId, page } = useAppSelector(state => state.garage);

  const [createName, setCreateName] = useState('');
  const [createColor, setCreateColor] = useState('#000000');
  const [updateName, setUpdateName] = useState('');
  const [updateColor, setUpdateColor] = useState('#000000');

  useEffect(() => {
    if (!selectedCarId) {
      setUpdateName('');
      setUpdateColor('#000000');
      return;
    }

    const selectedCar = cars.find(car => car.id === selectedCarId);

    if (selectedCar) {
      setUpdateName(selectedCar.name);
      setUpdateColor(selectedCar.color);
    }
  }, [cars, selectedCarId]);

  const isCreateNameValid =
    createName.trim().length >= MIN_NAME_LENGTH && createName.trim().length <= MAX_NAME_LENGTH;

  const isUpdateNameValid =
    updateName.trim().length >= MIN_NAME_LENGTH && updateName.trim().length <= MAX_NAME_LENGTH;

  const refreshCars = async () => {
    await dispatch(fetchCars(page));
  };

  const handleCreate = async () => {
    if (!isCreateNameValid) {
      return;
    }

    await dispatch(createCarThunk({ name: createName.trim(), color: createColor }));
    setCreateName('');
    setCreateColor('#000000');
    await refreshCars();
  };

  const handleUpdate = async () => {
    if (!selectedCarId || !isUpdateNameValid) {
      return;
    }

    await dispatch(
      updateCarThunk({
        id: selectedCarId,
        car: { name: updateName.trim(), color: updateColor },
      }),
    );

    dispatch(setSelectedCarId(null));
    setUpdateName('');
    setUpdateColor('#000000');
    await refreshCars();
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
          disabled={!isCreateNameValid}
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
          disabled={!selectedCarId || !isUpdateNameValid}
        >
          Update
        </button>
      </div>
    </section>
  );
};