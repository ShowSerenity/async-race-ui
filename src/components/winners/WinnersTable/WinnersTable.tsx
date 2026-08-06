import { useAppDispatch, useAppSelector } from '../../../hooks';
import { setSort } from '../../../features/winnersSlice';
import type { SortField, SortOrder, WinnerWithCar } from '../../../types/types';
import { CarIcon } from '../../common/CarIcon/CarIcon';
import './WinnersTable.css';

interface WinnersTableProps {
  winners: WinnerWithCar[];
  startIndex: number;
}

const TIME_FRACTION_DIGITS = 2;
const SORT_ASC_ICON = '▲';
const SORT_DESC_ICON = '▼';
const NO_SORT_ICON = '';

const getSortIcon = (field: SortField, activeSort: SortField, activeOrder: SortOrder): string => {
  if (activeSort !== field) {
    return NO_SORT_ICON;
  }

  return activeOrder === 'ASC' ? SORT_ASC_ICON : SORT_DESC_ICON;
};

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
    <table className="winners-table">
      <thead>
        <tr>
          <th>№</th>
          <th>Car</th>
          <th>Name</th>
          <th>
            <button
              className="winners-table__sort-btn"
              type="button"
              onClick={() => handleSort('wins')}
            >
              Wins {getSortIcon('wins', sort, order)}
            </button>
          </th>
          <th>
            <button
              className="winners-table__sort-btn"
              type="button"
              onClick={() => handleSort('time')}
            >
              Best time (s) {getSortIcon('time', sort, order)}
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {winners.map((winner, index) => (
          <tr key={winner.id}>
            <td>{startIndex + index + 1}</td>
            <td>
              <div className="winners-table__icon">
                <CarIcon color={winner.car?.color ?? '#ffffff'} />
              </div>
            </td>
            <td>{winner.car?.name ?? 'Unknown car'}</td>
            <td>{winner.wins}</td>
            <td>{winner.time.toFixed(TIME_FRACTION_DIGITS)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
