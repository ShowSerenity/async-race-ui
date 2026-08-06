import './WinnerBanner.css';

interface WinnerBannerProps {
  name: string;
  time: number;
}

const TIME_FRACTION_DIGITS = 2;

export const WinnerBanner = ({ name, time }: WinnerBannerProps) => (
  <div className="winner-banner" role="status">
    🏆 {name} wins the race! Time: {time.toFixed(TIME_FRACTION_DIGITS)}s
  </div>
);