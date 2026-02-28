import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TablePage from './pages/TablePage';
import DetailPage from './pages/DetailPage';
import OptimizationDashboard from './pages/OptimizationDashboard';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/optimization" element={<OptimizationDashboard />} />
          <Route path="/msmes" element={<TablePage />} />
          <Route path="/msme/:id" element={<DetailPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
