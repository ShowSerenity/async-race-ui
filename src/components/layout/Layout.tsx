import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const getLinkClassName = (path: string) =>
    location.pathname === path ? 'nav-link nav-link--active' : 'nav-link';

  return (
    <div className="app">
      <header className="app__header">
        <nav className="app__nav">
          <Link to="/garage" className={getLinkClassName('/garage')}>
            Garage
          </Link>
          <Link to="/winners" className={getLinkClassName('/winners')}>
            Winners
          </Link>
        </nav>
      </header>

      <main className="app__main">{children}</main>
    </div>
  );
};
