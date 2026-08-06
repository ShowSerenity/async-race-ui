import { useAppDispatch, useAppSelector } from '../../../hooks';
import { setSort } from '../../../features/winnersSlice';
import type { SortField, WinnerWithCar } from '../../../types/types';
import { CarIcon } from '../../common/CarIcon/CarIcon';
import './WinnersTable.css';

const TIME_FRACTION_DIGITS = 2;
const PLACEHOLDER_COLOR = '#666666';
const PLACEHOLDER_NAME = 'Unknown car';

interface SortHeaderProps {
  field: SortField;
  label: string;
  activeSort: SortField;
  activeOrder: 'ASC' | 'DESC';
  onSort: (field: SortField) => void;
}

const SortHeader = ({ field, label, activeSort, activeOrder, onSort }: SortHeaderProps) => {
  const isActive = activeSort === field;
  const arrow = isActive ? (activeOrder === 'ASC' ? '↑' : '↓') : '';

  return (
    <th className="winners-table__sortable" onClick={() => onSort(field)}>
      {label} {arrow}
    </th>
  );
};

const renderRow = (winner: WinnerWithCar, index: number) => {
  const name = winner.car?.name ?? PLACEHOLDER_NAME;
  const color = winner.car?.color ?? PLACEHOLDER_COLOR;

  return (
    <tr key={winner.id}>
      <td>{index + 1}</td>
      <td>
        <div className="winners-table__icon">
          <CarIcon color={color} />
        </div>
      </td>
      <td>{name}</td>
      <td>{winner.wins}</td>
      <td>{winner.time.toFixed(TIME_FRACTION_DIGITS)}</td>
    </tr>
  );
};

interface WinnersTableProps {
  winners: WinnerWithCar[];
  startIndex: number;
}

export const WinnersTable = ({ winners, startIndex }: WinnersTableProps) => {
  const dispatch = useAppDispatch();
  const { sort, order } = useAppSelector(state => state.winners);

  const handleSort = (field: SortField) => {
    dispatch(setSort(field));
  };

  if (winners.length === 0) {
    return <div className="empty-state">No winners yet</div>;
  }

  return (
    <table className="winners-table panel">
      <thead>
        <tr>
          <th>№</th>
          <th>Car</th>
          <th>Name</th>
          <SortHeader field="wins" label="Wins" activeSort={sort} activeOrder={order} onSort={handleSort} />
          <SortHeader
            field="time"
            label="Best time (s)"
            activeSort={sort}
            activeOrder={order}
            onSort={handleSort}
          />
        </tr>
      </thead>
      <tbody>{winners.map((winner, index) => renderRow(winner, startIndex + index))}</tbody>
    </table>
  );
};