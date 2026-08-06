import { createPortal } from 'react-dom';
import './WinnerBanner.css';

interface WinnerBannerProps {
  name: string;
  time: number;
  onClose: () => void;
}

const TIME_FRACTION_DIGITS = 2;

export const WinnerBanner = ({ name, time, onClose }: WinnerBannerProps) =>
  createPortal(
    <div className="winner-overlay" role="dialog" aria-modal="true">
      <div className="winner-banner">
        <div className="winner-banner__inner">
          <span className="winner-banner__title">WINNER:</span>
          <span className="winner-banner__name">{name}</span>
          <span className="winner-banner__time">TIME: {time.toFixed(TIME_FRACTION_DIGITS)}S</span>

          <button className="winner-banner__close" type="button" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
