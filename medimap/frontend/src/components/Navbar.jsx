// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLang } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { lang, toggleLang, t } = useLang();
  const { dark, toggleTheme } = useTheme();

  useEffect(() => {
    const stored = localStorage.getItem('medimap_user');
    if (stored) setUser(JSON.parse(stored));
    else setUser(null);
  }, [location]);

  const logout = () => {
    localStorage.removeItem('medimap_user');
    setUser(null);
    setDropdownOpen(false);
    navigate('/');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const links = [
    { to: '/', label: t('home') },
    { to: '/scan', label: t('scanRx') },
    { to: '/map', label: t('mapView') },
    { to: '/submit-price', label: t('updatePrice') },
  ];

  return (
    <nav className="sticky top-0 z-50 shadow-sm border-b" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2E7DFF] to-[#00C2A8] flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white"/>
                <circle cx="12" cy="9" r="2.5" fill="rgba(255,255,255,0.4)"/>
              </svg>
            </div>
            <span className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
              Medi<span className="text-[#2E7DFF]">Map</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link key={link.to} to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.to
                    ? 'bg-blue-50 text-[#2E7DFF]'
                    : 'hover:bg-gray-50'
                }`}
                style={{ color: location.pathname === link.to ? '#2E7DFF' : 'var(--text-secondary)' }}>
                {link.label}
              </Link>
            ))}

            {/* Language toggle */}
            <button onClick={toggleLang}
              className="ml-1 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all hover:bg-gray-50"
              style={{ border: '1.5px solid var(--border)', color: 'var(--text-primary)' }}>
              <span>{lang === 'en' ? '🇮🇳' : '🇬🇧'}</span>
              <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="ml-1 w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:bg-gray-50"
              style={{ border: '1.5px solid var(--border)' }}
              title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {dark ? (
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd"/>
                </svg>
              )}
            </button>

            {/* Auth */}
            {user ? (
              <div className="ml-1 relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-xl px-3 py-1.5 transition-all"
                  style={{ backgroundColor: 'rgba(46,125,255,0.1)', border: '1px solid rgba(46,125,255,0.2)' }}>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2E7DFF] to-[#00C2A8] flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</span>
                  <svg className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-12 rounded-xl shadow-xl w-48 py-2 z-50" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <Link to="/profile" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: 'var(--text-primary)' }}>
                      👤 {lang === 'hi' ? 'मेरी प्रोफ़ाइल' : 'My Profile'}
                    </Link>
                    <Link to="/submit-price" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: 'var(--text-primary)' }}>
                      💊 {lang === 'hi' ? 'कीमत जमा करें' : 'Submit Price'}
                    </Link>
                    <div className="my-1" style={{ borderTop: '1px solid var(--border)' }}></div>
                    <button onClick={logout}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full text-left transition-colors">
                      🚪 {lang === 'hi' ? 'लॉगआउट' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-1 flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm !py-2 !px-4">
                  {lang === 'hi' ? 'लॉगिन' : 'Login'}
                </Link>
                <Link to="/signup" className="btn-primary text-sm !py-2 !px-4">
                  {lang === 'hi' ? 'साइन अप' : 'Sign Up'}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Dark mode mobile */}
            <button onClick={toggleTheme} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ border: '1px solid var(--border)' }}>
              {dark ? '☀️' : '🌙'}
            </button>
            <button onClick={toggleLang} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              <span>{lang === 'en' ? '🇮🇳' : '🇬🇧'}</span>
              <span>{lang === 'en' ? 'हिंदी' : 'EN'}</span>
            </button>
            <button className="p-2 rounded-lg" style={{ color: 'var(--text-primary)' }} onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
            {links.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors"
                style={{ color: location.pathname === link.to ? '#2E7DFF' : 'var(--text-secondary)', backgroundColor: location.pathname === link.to ? 'rgba(46,125,255,0.1)' : 'transparent' }}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm rounded-lg mb-1" style={{ color: 'var(--text-secondary)' }}>
                  👤 {lang === 'hi' ? 'मेरी प्रोफ़ाइल' : 'My Profile'}
                </Link>
                <button onClick={logout} className="block w-full text-left px-4 py-2.5 text-sm text-red-500 rounded-lg">
                  🚪 {lang === 'hi' ? 'लॉगआउट' : 'Logout'}
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-4 mt-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 btn-secondary text-center text-sm !py-2">
                  {lang === 'hi' ? 'लॉगिन' : 'Login'}
                </Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="flex-1 btn-primary text-center text-sm !py-2">
                  {lang === 'hi' ? 'साइन अप' : 'Sign Up'}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
