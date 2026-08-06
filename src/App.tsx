import { Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { GaragePage } from './pages/GaragePage/GaragePage';
import { WinnersPage } from './pages/WinnersPage/WinnersPage';

const App = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Navigate to="/garage" replace />} />
      <Route path="/garage" element={<GaragePage />} />
      <Route path="/winners" element={<WinnersPage />} />
    </Routes>
  </Layout>
);

export default App;
