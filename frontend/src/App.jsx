import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TablePage from './pages/TablePage';
import DetailPage from './pages/DetailPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col w-full">
        <nav className="bg-indigo-600 text-white shadow-lg w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <span className="font-bold text-xl tracking-wider">MSME Predictor</span>
              </div>
              <div className="flex space-x-4">
                <Link to="/" className="px-3 py-2 rounded-md font-medium hover:bg-indigo-500 transition-colors">Dashboard</Link>
                <Link to="/msmes" className="px-3 py-2 rounded-md font-medium hover:bg-indigo-500 transition-colors">MSME List</Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/msmes" element={<TablePage />} />
            <Route path="/msme/:id" element={<DetailPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
