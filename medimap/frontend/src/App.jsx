// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import VoiceAssistant from './components/VoiceAssistant';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import MapViewPage from './pages/MapViewPage';
import PharmacyDetailPage from './pages/PharmacyDetailPage';
import SubmitPricePage from './pages/SubmitPricePage';
import ScanPrescription from './pages/ScanPrescription';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/map" element={<MapViewPage />} />
              <Route path="/pharmacy/:id" element={<PharmacyDetailPage />} />
              <Route path="/submit-price" element={<SubmitPricePage />} />
              <Route path="/scan" element={<ScanPrescription />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
            <VoiceAssistant />
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
