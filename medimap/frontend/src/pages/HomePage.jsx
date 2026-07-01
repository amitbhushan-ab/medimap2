// frontend/src/pages/HomePage.jsx
// FIX #2: CTA button scrolls to search bar and focuses it — does NOT auto-search Paracetamol
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

const POPULAR_EN = ['Paracetamol 500mg', 'Azithromycin 500mg', 'Metformin 500mg', 'Cetirizine 10mg'];
const POPULAR_HI = ['पैरासिटामोल', 'एज़िथ्रोमाइसिन', 'मेटफ़ॉर्मिन', 'सिट्रीज़िन'];
const STATS_DATA = [
  { value: '500+', en: 'Pharmacies', hi: 'फार्मेसियां', icon: '🏥' },
  { value: '2,000+', en: 'Medicines', hi: 'दवाइयां', icon: '💊' },
  { value: '₹340', en: 'Avg Savings', hi: 'औसत बचत', icon: '💰' },
  { value: '4.9★', en: 'Rating', hi: 'रेटिंग', icon: '⭐' },
];
const FEATURES_DATA = [
  { icon: '🔍', en: 'Real-time Search', hi: 'रियल-टाइम खोज', descEn: 'Compare prices instantly across all nearby pharmacies', descHi: 'सभी पास की फार्मेसियों में तुरंत कीमतें तुलना करें' },
  { icon: '🗺️', en: 'Live Map View', hi: 'लाइव मैप', descEn: 'Find nearest pharmacy with best price on map', descHi: 'मैप पर सबसे नज़दीक और सस्ती फार्मेसी खोजें' },
  { icon: '📋', en: 'AI Prescription Scanner', hi: 'AI पर्ची स्कैनर', descEn: 'Upload prescription — AI extracts all medicines', descHi: 'पर्ची अपलोड करें — AI सभी दवाइयां निकाल देगा' },
  { icon: '💊', en: 'Generic Alternatives', hi: 'जेनेरिक विकल्प', descEn: 'Save 40-60% with equivalent generic medicines', descHi: 'जेनेरिक दवाइयों से 40-60% बचाएं' },
  { icon: '🎙️', en: 'Voice Search', hi: 'वॉयस सर्च', descEn: 'Search hands-free in Hindi or English', descHi: 'हिंदी या अंग्रेज़ी में बिना हाथ लगाए खोजें' },
  { icon: '🏆', en: 'MediPoints Rewards', hi: 'मेडीपॉइंट्स', descEn: 'Earn points for every price update', descHi: 'हर कीमत अपडेट पर पॉइंट्स कमाएं' },
];
const TYPING_WORDS_EN = ['Paracetamol 500mg', 'Azithromycin 500mg', 'Metformin 500mg', 'Cetirizine 10mg'];
const TYPING_WORDS_HI = ['पैरासिटामोल', 'एज़िथ्रोमाइसिन', 'मेटफ़ॉर्मिन', 'सिट्रीज़िन'];

export default function HomePage() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [typingIdx, setTypingIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef(null);
  const searchSectionRef = useRef(null);

  const popular = lang === 'hi' ? POPULAR_HI : POPULAR_EN;
  const typingWords = lang === 'hi' ? TYPING_WORDS_HI : TYPING_WORDS_EN;

  // Typewriter effect
  useEffect(() => {
    if (focused || query) return;
    const word = typingWords[typingIdx % typingWords.length];
    const speed = isDeleting ? 40 : 80;
    const timeout = setTimeout(() => {
      setTypedText(prev => {
        if (!isDeleting && prev === word) { setTimeout(() => setIsDeleting(true), 1500); return prev; }
        if (isDeleting && prev === '') { setIsDeleting(false); setTypingIdx(i => i + 1); return ''; }
        return isDeleting ? prev.slice(0, -1) : word.slice(0, prev.length + 1);
      });
    }, speed);
    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, typingIdx, focused, query, lang]);

  function handleSearch(q = query) {
    const term = q.trim();
    if (!term) {
      // FIX #2: If empty, just scroll and focus the search bar
      searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => inputRef.current?.focus(), 400);
      return;
    }
    const history = JSON.parse(localStorage.getItem('medimap_search_history') || '[]');
    const updated = [{ query: term, date: new Date().toISOString() }, ...history.filter(h => h.query !== term)].slice(0, 10);
    localStorage.setItem('medimap_search_history', JSON.stringify(updated));
    navigate(`/results?q=${encodeURIComponent(term)}`);
  }

  // FIX #2: CTA button scrolls to search and focuses — does NOT search Paracetamol
  function handleCTAClick() {
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => inputRef.current?.focus(), 500);
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden" style={{ paddingTop: 64 }}>
        {/* Background */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(27,110,243,0.3) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 60%, rgba(0,194,168,0.25) 0%, transparent 60%), linear-gradient(145deg, #060D1F 0%, #0B1628 50%, #080F1A 100%)'
        }}/>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '32px 32px' }}/>
        <div className="absolute top-32 left-16 w-64 h-64 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #1B6EF3, transparent)', filter: 'blur(40px)', animation: 'floatAnim 3s ease-in-out infinite' }}/>
        <div className="absolute top-48 right-24 w-48 h-48 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #00C2A8, transparent)', filter: 'blur(32px)', animation: 'floatAnim 3s ease-in-out 1s infinite' }}/>

        {/* Content */}
        <div ref={searchSectionRef} className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
          {/* Badge */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border"
              style={{ background: 'rgba(27,110,243,0.15)', borderColor: 'rgba(27,110,243,0.3)', color: '#7EC8FF', backdropFilter: 'blur(10px)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"/>
              {lang === 'hi' ? 'भारत का #1 दवाई कीमत तुलना प्लेटफ़ॉर्म' : "India's #1 Medicine Price Comparison Platform"}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl leading-tight" style={{ fontFamily: 'Sora, DM Sans, sans-serif' }}>
            <span style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #A8D8FF 50%, #7FFFD4 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {lang === 'hi' ? 'पास में सबसे सस्ती दवाई' : 'Find Medicines at the Best Price'}
            </span>
            <br/>
            <span className="text-white">{lang === 'hi' ? 'खोजें' : 'Near You'}</span>
          </h1>

          <p className="text-base sm:text-lg mb-10 max-w-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {lang === 'hi' ? '500+ फार्मेसियों में कीमतें तुलना करें। दवाइयों पर 60% तक बचाएं।' : 'Compare prices across 500+ pharmacies. Save up to 60% on medicines.'}
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-2xl mb-8">
            <div className="relative flex items-center rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.97)',
                border: focused ? '2px solid #1B6EF3' : '2px solid rgba(255,255,255,0.15)',
                boxShadow: focused ? '0 0 0 6px rgba(27,110,243,0.15), 0 20px 60px rgba(0,0,0,0.3)' : '0 20px 60px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease',
              }}>
              <div className="pl-5 pr-2">
                <svg className="w-5 h-5" style={{ color: focused ? '#1B6EF3' : '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={focused ? (lang === 'hi' ? 'दवाई का नाम लिखें...' : 'Type medicine name...') : (typedText || (lang === 'hi' ? 'दवाई खोजें...' : 'Search medicines...'))}
                className="flex-1 py-4 px-2 text-base font-medium outline-none bg-transparent"
                style={{ color: '#0D1B2A', fontFamily: 'DM Sans, sans-serif' }}
              />
              <button onClick={() => handleSearch()}
                className="m-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #1B6EF3, #00C2A8)', fontFamily: 'Sora, sans-serif' }}>
                {lang === 'hi' ? 'खोजें' : 'Search'}
              </button>
            </div>

            {/* Quick searches */}
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {popular.map(med => (
                <button key={med} onClick={() => handleSearch(med)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  {med}
                </button>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/scan">
              <button className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.25)', color: 'white', backdropFilter: 'blur(10px)' }}>
                📋 {lang === 'hi' ? 'पर्ची स्कैन करें' : 'Scan Prescription'}
              </button>
            </Link>
            <Link to="/map">
              <button className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.25)', color: 'white', backdropFilter: 'blur(10px)' }}>
                🗺️ {lang === 'hi' ? 'मैप देखें' : 'View Map'}
              </button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STATS_DATA.map((s, i) => (
              <div key={i} className="text-center p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>{s.value}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{lang === 'hi' ? s.hi : s.en}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none" style={{ display: 'block', height: 60 }}>
            <path d="M0,60 C360,0 1080,60 1440,20 L1440,60 Z" fill="var(--bg-primary)"/>
          </svg>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--bg-subtle, #F0F4FF)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
              {lang === 'hi' ? 'दवाइयों पर बचत के लिए सब कुछ' : 'Everything to Save on Medicines'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES_DATA.map((f, i) => (
              <div key={i} className="card p-6 group cursor-pointer"
                style={{ transition: 'all 0.25s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
                  {lang === 'hi' ? f.hi : f.en}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {lang === 'hi' ? f.descHi : f.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden p-12 text-center"
            style={{ background: 'linear-gradient(145deg, #060D1F 0%, #0E2044 50%, #0A2E3A 100%)' }}>
            <div className="absolute top-6 left-12 w-32 h-32 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #1B6EF3, transparent)', filter: 'blur(20px)' }}/>
            <div className="relative z-10">
              <div className="text-4xl mb-4">💊</div>
              <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
                {lang === 'hi' ? 'बचत शुरू करने के लिए तैयार?' : 'Ready to Start Saving?'}
              </h2>
              <p className="mb-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {lang === 'hi' ? 'MediMap से हर महीने ₹340 बचाएं' : 'Join 10,000+ Indians who save ₹340 every month'}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {/* FIX #2: Scrolls to search and focuses — does NOT auto-search */}
                <button onClick={handleCTAClick}
                  className="px-8 py-4 rounded-full text-base font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #1B6EF3, #00C2A8)', fontFamily: 'Sora, sans-serif' }}>
                  🔍 {lang === 'hi' ? 'अभी खोजें — मुफ़्त' : 'Search Now — Free'}
                </button>
                <Link to="/about">
                  <button className="px-8 py-4 rounded-full text-base font-semibold transition-all"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.25)', color: 'white' }}>
                    {lang === 'hi' ? 'और जानें →' : 'Learn More →'}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="py-10 px-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="MediMap" className="h-8 object-contain" />
            <span className="font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
              Medi<span style={{ color: '#00C2A8' }}>Map</span>
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            © 2026 MediMap · {lang === 'hi' ? 'हर भारतीय के लिए स्वास्थ्य सेवा सस्ती बनाना' : 'Making Healthcare Affordable for Every Indian'}
          </p>
          <div className="flex gap-4">
            {[['about', lang === 'hi' ? 'हमारे बारे में' : 'About'],
              ['pharmacy-dashboard', lang === 'hi' ? 'फार्मासिस्ट' : 'Pharmacists'],
              ['admin', 'Admin']].map(([path, label]) => (
              <Link key={path} to={`/${path}`} className="text-sm hover:text-blue-500 transition-colors" style={{ color: 'var(--text-muted)' }}>{label}</Link>
            ))}
          </div>
        </div>
      </footer>

      <style>{`@keyframes floatAnim { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
    </div>
  );
}
