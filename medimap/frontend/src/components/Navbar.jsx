// src/components/Navbar.jsx — FIXED: fixed positioning, pharmacist support, full Hindi
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useLang } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isPharmacist, setIsPharmacist] = useState(false);
  const [pharmacistInfo, setPharmacistInfo] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, toggleLang, t } = useLang();
  const { dark, toggleTheme } = useTheme();
  const dropRef = useRef(null);
  const isHero = location.pathname === '/';

  useEffect(() => {
    const stored = localStorage.getItem('medimap_user');
    setUser(stored ? JSON.parse(stored) : null);
    const phToken = localStorage.getItem('pharmacist_token');
    const phInfo = localStorage.getItem('pharmacist_info');
    if (phToken && phInfo) { setIsPharmacist(true); setPharmacistInfo(JSON.parse(phInfo)); }
    else { setIsPharmacist(false); setPharmacistInfo(null); }
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive:true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const logout = () => {
    localStorage.removeItem('medimap_user');
    localStorage.removeItem('pharmacist_token');
    localStorage.removeItem('pharmacist_info');
    setUser(null); setIsPharmacist(false); setPharmacistInfo(null);
    setDropdownOpen(false); navigate('/');
  };

  const isLoggedIn = !!(user || isPharmacist);
  const displayName = isPharmacist ? (pharmacistInfo?.name || 'Pharmacy') : (user?.name || '');
  const initials = displayName.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || '?';

  // On hero page: transparent → frosted on scroll. On other pages: always frosted.
  const frosted = !isHero || scrolled;

  const navLinks = [
    { to:'/', label: t('home') },
    { to:'/map', label: t('mapView') },
    { to:'/scan', label: t('scanRx') },
    { to:'/about', label: t('about') || 'About' },
  ];

  const navBg = frosted
    ? 'rgba(255,255,255,0.92)'
    : 'transparent';
  const navBorder = frosted ? '1px solid rgba(229,231,235,0.8)' : 'none';
  const navShadow = frosted ? '0 1px 12px rgba(0,0,0,0.06)' : 'none';
  const textColor = frosted ? 'var(--text-secondary)' : 'rgba(255,255,255,0.85)';
  const activeColor = frosted ? '#1B6EF3' : 'white';

  return (
    // FIXED: use fixed instead of sticky so it doesn't cause layout shift
    <nav style={{
      position:'fixed', top:0, left:0, right:0, zIndex:100,
      background: dark ? (frosted ? 'rgba(10,15,30,0.92)' : 'transparent') : navBg,
      borderBottom: navBorder,
      boxShadow: navShadow,
      backdropFilter: frosted ? 'blur(20px)' : 'none',
      WebkitBackdropFilter: frosted ? 'blur(20px)' : 'none',
      transition:'all 0.3s ease',
    }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 20px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>

          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/logo.png" alt="MediMap" className="h-10 object-contain" />
            <span className="font-bold text-2xl tracking-tight" style={{ color: dark ? 'white' : '#1A1A1A' }}>
              Medi<span style={{ color:'#00C2A8' }}>Map</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div style={{ display:'flex', alignItems:'center', gap:4 }} className="hidden md:flex">
            {navLinks.map(link => {
              const active = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to}
                  style={{
                    padding:'8px 14px', borderRadius:10, fontSize:14, fontWeight:500, textDecoration:'none',
                    color: active ? '#1B6EF3' : textColor,
                    background: active ? 'rgba(27,110,243,0.1)' : 'transparent',
                    transition:'all 0.2s',
                  }}
                  onMouseEnter={e => { if (!active) { e.target.style.color = activeColor; e.target.style.background = frosted ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'; } }}
                  onMouseLeave={e => { if (!active) { e.target.style.color = textColor; e.target.style.background = 'transparent'; } }}>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* Lang */}
            <button onClick={toggleLang} title="Toggle language"
              style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:8, border:`1px solid ${frosted?'var(--border)':'rgba(255,255,255,0.25)'}`, background: frosted ? 'var(--bg-card)' : 'rgba(255,255,255,0.1)', cursor:'pointer', fontSize:13, fontWeight:600, color: frosted ? 'var(--text-primary)' : 'white' }}>
              <span>{lang === 'en' ? '🇮🇳' : '🇬🇧'}</span>
              <span className="hidden sm:inline">{lang === 'en' ? 'हिंदी' : 'EN'}</span>
            </button>

            {/* Dark mode */}
            <button onClick={toggleTheme}
              style={{ width:36, height:36, borderRadius:8, border:`1px solid ${frosted?'var(--border)':'rgba(255,255,255,0.25)'}`, background: frosted ? 'var(--bg-card)' : 'rgba(255,255,255,0.1)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {dark
                ? <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/></svg>
                : <svg className="w-4 h-4" style={{ color: frosted ? 'var(--text-secondary)' : 'white' }} fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
              }
            </button>

            {/* Auth */}
            {isLoggedIn ? (
              <div ref={dropRef} style={{ position:'relative' }}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', borderRadius:10, border:`1px solid ${isPharmacist?'rgba(16,185,129,0.3)':'rgba(27,110,243,0.25)'}`, background: isPharmacist ? 'rgba(16,185,129,0.1)' : 'rgba(27,110,243,0.08)', cursor:'pointer' }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:isPharmacist?'linear-gradient(135deg,#10b981,#059669)':'linear-gradient(135deg,#1B6EF3,#00C2A8)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:11, fontWeight:700 }}>
                    {isPharmacist ? '🏥' : initials}
                  </div>
                  <span style={{ fontSize:13, fontWeight:600, color: frosted ? 'var(--text-primary)' : 'white', maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} className="hidden sm:block">
                    {displayName.split(' ')[0]}
                  </span>
                  <svg style={{ width:12, height:12, color: frosted ? 'var(--text-muted)' : 'rgba(255,255,255,0.7)', transform:dropdownOpen?'rotate(180deg)':'none', transition:'transform 0.2s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {dropdownOpen && (
                  <div style={{ position:'absolute', right:0, top:48, width:220, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, boxShadow:'0 20px 60px rgba(0,0,0,0.15)', zIndex:200, overflow:'hidden' }}>
                    <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', background: isPharmacist ? 'rgba(16,185,129,0.05)' : 'rgba(27,110,243,0.05)' }}>
                      <p style={{ fontSize:11, fontWeight:700, color: isPharmacist ? '#10b981' : '#1B6EF3', marginBottom:2 }}>
                        {isPharmacist ? '🏥 PHARMACY OWNER' : '👤 CUSTOMER'}
                      </p>
                      <p style={{ fontSize:13, color:'var(--text-primary)', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{displayName}</p>
                    </div>

                    {isPharmacist ? (<>
                      <DropItem to="/pharmacy-dashboard" icon="📦" label={lang==='hi'?'स्टॉक और बिलिंग':'Stock & Billing'} onClose={() => setDropdownOpen(false)}/>
                      <DropItem to="/pharmacy-dashboard" icon="📈" label={lang==='hi'?'एनालिटिक्स':'Analytics'} onClose={() => setDropdownOpen(false)}/>
                    </>) : (<>
                      <DropItem to="/profile" icon="👤" label={t('myProfile')} onClose={() => setDropdownOpen(false)}/>
                      <DropItem to="/points" icon="🏆" label={t('mediPoints')} onClose={() => setDropdownOpen(false)}/>
                      <DropItem to="/submit-price" icon="💊" label={t('submitPrice')} onClose={() => setDropdownOpen(false)}/>
                    </>)}

                    <div style={{ borderTop:'1px solid var(--border)', padding:'4px 0' }}>
                      <button onClick={logout}
                        style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 16px', fontSize:13, fontWeight:500, color:'#dc2626', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <span>🚪</span> {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display:'flex', gap:8 }} className="hidden md:flex">
                <Link to="/login">
                  <button style={{ padding:'8px 16px', borderRadius:10, border:`1px solid ${frosted?'var(--border)':'rgba(255,255,255,0.3)'}`, background:'transparent', color: frosted ? 'var(--text-primary)' : 'white', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                    {t('login')}
                  </button>
                </Link>
                <Link to="/signup">
                  <button style={{ padding:'8px 18px', borderRadius:10, background:'linear-gradient(135deg,#1B6EF3,#00C2A8)', color:'white', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Sora, sans-serif' }}>
                    {t('signup')}
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ display:'flex', width:36, height:36, borderRadius:8, border:`1px solid ${frosted?'var(--border)':'rgba(255,255,255,0.25)'}`, background: frosted ? 'var(--bg-card)' : 'rgba(255,255,255,0.1)', alignItems:'center', justifyContent:'center', cursor:'pointer', color: frosted ? 'var(--text-primary)' : 'white' }}
              className="md:hidden">
              <svg style={{ width:18, height:18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ borderTop:'1px solid var(--border)', paddingBottom:16, paddingTop:8, background: dark ? 'rgba(10,15,30,0.98)' : 'rgba(255,255,255,0.98)', backdropFilter:'blur(20px)' }}>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                style={{ display:'block', padding:'10px 16px', borderRadius:10, fontSize:14, fontWeight:500, textDecoration:'none', color: location.pathname === link.to ? '#1B6EF3' : 'var(--text-secondary)', background: location.pathname === link.to ? 'rgba(27,110,243,0.08)' : 'transparent', marginBottom:2 }}>
                {link.label}
              </Link>
            ))}
            {!isLoggedIn && (
              <div style={{ display:'flex', gap:8, padding:'8px 16px', marginTop:8 }}>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{ flex:1 }}>
                  <button style={{ width:'100%', padding:'10px', borderRadius:10, border:'1.5px solid var(--border)', background:'var(--bg-card)', color:'var(--text-primary)', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                    {t('login')}
                  </button>
                </Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} style={{ flex:1 }}>
                  <button style={{ width:'100%', padding:'10px', borderRadius:10, background:'linear-gradient(135deg,#1B6EF3,#00C2A8)', color:'white', border:'none', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                    {t('signup')}
                  </button>
                </Link>
              </div>
            )}
            {isLoggedIn && (
              <button onClick={() => { setMenuOpen(false); logout(); }}
                style={{ display:'block', width:'100%', textAlign:'left', padding:'10px 16px', fontSize:14, color:'#dc2626', background:'none', border:'none', cursor:'pointer' }}>
                🚪 {t('logout')}
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function DropItem({ to, icon, label, onClose }) {
  return (
    <Link to={to} onClick={onClose}
      style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', fontSize:13, fontWeight:500, color:'var(--text-secondary)', textDecoration:'none', transition:'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <span>{icon}</span> {label}
    </Link>
  );
}
