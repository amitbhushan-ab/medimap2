import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import MapViewPage from './pages/MapViewPage';
import PharmacyDetailPage from './pages/PharmacyDetailPage';
import SubmitPricePage from './pages/SubmitPricePage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f8faff]">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/map" element={<MapViewPage />} />
          <Route path="/pharmacy/:id" element={<PharmacyDetailPage />} />
          <Route path="/submit-price" element={<SubmitPricePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
