import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Visualizer from './pages/Visualizer';
import Topological from './pages/Topological';
import Complexity from './pages/Complexity';
import Performance from './pages/Performance';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"            element={<Dashboard />} />
          <Route path="/visualizer"  element={<Visualizer />} />
          <Route path="/topological" element={<Topological />} />
          <Route path="/complexity"  element={<Complexity />} />
          <Route path="/performance" element={<Performance />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
