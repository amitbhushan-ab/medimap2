// frontend/src/App.jsx — POINT 1: Pharmacist portal completely separate from customer page
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LangProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import VoiceSearch from './components/VoiceSearch';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import MapViewPage from './pages/MapViewPage';
import ScanPrescription from './pages/ScanPrescription';
import PharmacyDetailPage from './pages/PharmacyDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import SubmitPricePage from './pages/SubmitPricePage';
import AdminPage from './pages/AdminPage';
import PharmacistDashboard from './pages/PharmacistDashboard';
import MediPoints from './pages/MediPoints';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <BrowserRouter>
          <AppInner/>
        </BrowserRouter>
      </LangProvider>
    </ThemeProvider>
  );
}

// POINT 1 — useLocation inside BrowserRouter = always correct, no refresh needed
function AppInner() {
  const location = useLocation();
  const isPharmacist = location.pathname.startsWith('/pharmacy-dashboard') || location.pathname.startsWith('/pharmacist-dashboard');

  // POINT 1 — Pharmacist portal: completely isolated, no Navbar, no ChatBot, no VoiceSearch
  if (isPharmacist) {
    return <PharmacistDashboard/>;
  }

  // Customer portal: Navbar + ChatBot + VoiceSearch
  return (
    <div style={{ minHeight:'100vh', backgroundColor:'var(--bg-primary)' }}>
      <Navbar/>
      <main>
        <Routes>
          <Route path="/" element={<HomePage/>}/>
          <Route path="/results" element={<Pad><ResultsPage/></Pad>}/>
          <Route path="/map" element={<Pad><MapViewPage/></Pad>}/>
          <Route path="/scan" element={<ScanPrescription/>}/>
          <Route path="/pharmacy/:id" element={<Pad><PharmacyDetailPage/></Pad>}/>
          <Route path="/login" element={<Pad noPad><LoginPage/></Pad>}/>
          <Route path="/signup" element={<Pad noPad><SignupPage/></Pad>}/>
          <Route path="/profile" element={<Pad><ProfilePage/></Pad>}/>
          <Route path="/submit-price" element={<Pad><SubmitPricePage/></Pad>}/>
          <Route path="/admin" element={<Pad noPad><AdminPage/></Pad>}/>
          <Route path="/points" element={<Pad><MediPoints/></Pad>}/>
          <Route path="/about" element={<Pad><AboutPage/></Pad>}/>
        </Routes>
      </main>
      {/* ChatBot z-index 1000, VoiceSearch 999 — no overlap */}
      <ChatBot/>
      <VoiceSearch/>
    </div>
  );
}

function Pad({ children, noPad }) {
  return <div style={{ paddingTop:noPad?0:64, minHeight:'calc(100vh - 64px)' }}>{children}</div>;
}