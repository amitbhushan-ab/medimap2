import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

const POPULAR_EN = ['Paracetamol 500mg', 'Azithromycin 500mg', 'Metformin 500mg', 'Cetirizine 10mg'];
const POPULAR_HI = ['पैरासिटामोल', 'एज़िथ्रोमाइसिन', 'मेटफ़ॉर्मिन', 'सिट्रीज़िन'];
const STATS_DATA = [
  { value: '500+', en: 'Pharmacies', hi: 'फार्मेसियां', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 13h-2v-3H6v-2h3V8h2v3h3v2h-3v3z"/></svg>, color: 'from-blue-400 to-blue-600' },
  { value: '2,000+', en: 'Medicines', hi: 'दवाइयां', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M18.17 6.48l-2.65-2.65c-1.17-1.17-3.07-1.17-4.24 0L3.83 11.28c-1.17 1.17-1.17 3.07 0 4.24l2.65 2.65c1.17 1.17 3.07 1.17 4.24 0l7.45-7.45c1.17-1.17 1.17-3.07 0-4.24zM8.59 16.76l-2.65-2.65 6.03-6.03 2.65 2.65-6.03 6.03z"/></svg>, color: 'from-teal-400 to-teal-600' },
  { value: '₹340', en: 'Avg Savings', hi: 'औसत बचत', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-1.07A2 2 0 0 1 9.5 14h3v-2H9.5a2 2 0 0 1-2-2v-.5h2V10.5h2v-1.07c.84.18 1.5 1.05 1.5 1.93h-3v2h3a2 2 0 0 1 2 2v.5h-2v1.14z"/></svg>, color: 'from-emerald-400 to-emerald-600' },
  { value: '4.9★', en: 'Rating', hi: 'रेटिंग', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>, color: 'from-amber-400 to-amber-600' },
];

const FEATURES_BENTO = [
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>, titleEn: 'Real-time Search', titleHi: 'रियल-टाइम खोज', descEn: 'Compare prices instantly across all nearby pharmacies to secure the best deal.', descHi: 'सबसे अच्छी डील के लिए पास की फार्मेसियों में तुरंत कीमतें तुलना करें।', colSpan: 'col-span-1 md:col-span-2' },
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>, titleEn: 'AI Prescription Scanner', titleHi: 'AI पर्ची स्कैनर', descEn: 'Upload your prescription and let our AI extract all medicines automatically.', descHi: 'पर्ची अपलोड करें — AI सभी दवाइयां अपने आप निकाल देगा।', colSpan: 'col-span-1' },
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>, titleEn: 'Live Map View', titleHi: 'लाइव मैप', descEn: 'Locate the nearest and most affordable pharmacy on an interactive map.', descHi: 'इंटरैक्टिव मैप पर सबसे नज़दीक और सस्ती फार्मेसी खोजें।', colSpan: 'col-span-1' },
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M18.17 6.48l-2.65-2.65c-1.17-1.17-3.07-1.17-4.24 0L3.83 11.28c-1.17 1.17-1.17 3.07 0 4.24l2.65 2.65c1.17 1.17 3.07 1.17 4.24 0l7.45-7.45c1.17-1.17 1.17-3.07 0-4.24zM8.59 16.76l-2.65-2.65 6.03-6.03 2.65 2.65-6.03 6.03z"/></svg>, titleEn: 'Generic Alternatives', titleHi: 'जेनेरिक विकल्प', descEn: 'Save up to 60% with highly effective equivalent generic medicines.', descHi: 'समान जेनेरिक दवाइयों के साथ 60% तक की भारी बचत करें।', colSpan: 'col-span-1 md:col-span-2' },
];

const STEPS_DATA = [
  { step: '1', titleEn: 'Search Medicine', titleHi: 'दवाई खोजें', descEn: 'Type or use voice search to find your prescribed medicine instantly.', descHi: 'अपनी दवाई खोजने के लिए टाइप करें या वॉयस सर्च का उपयोग करें।' },
  { step: '2', titleEn: 'Compare Prices', titleHi: 'कीमतें तुलना करें', descEn: 'See real-time prices from 500+ local pharmacies in a single view.', descHi: '500+ स्थानीय फार्मेसियों से रियल-टाइम कीमतें एक ही जगह देखें।' },
  { step: '3', titleEn: 'Save & Buy', titleHi: 'बचाएं और खरीदें', descEn: 'Navigate to the cheapest pharmacy and save money on your bill.', descHi: 'सबसे सस्ती फार्मेसी पर जाएं और अपने बिल पर पैसे बचाएं।' }
];

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
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  function toggleListening() {
    // If already listening, stop
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'hi' ? 'आपका ब्राउज़र वॉयस सर्च का समर्थन नहीं करता है।' : 'Your browser does not support Speech Recognition.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognition.onerror = (e) => {
      console.warn('Voice recognition error:', e.error);
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const cleaned = transcript.replace(/[.।]$/g, '').trim();
      const text = cleaned.toLowerCase().trim();

      console.log('Voice heard:', text);

      // --- Navigation Commands ---
      if (
        text.includes('scan') ||
        text.includes('prescription') ||
        text.includes('पर्ची') ||
        text.includes('पर्चा') ||
        text.includes('स्कैन')
      ) {
        navigate('/scan');
        return;
      }

      if (
        text.includes('map') ||
        text.includes('location') ||
        text.includes('dikhao') ||
        text.includes('नक्शा') ||
        text.includes('मैप') ||
        text.includes('लोकेशन')
      ) {
        navigate('/map');
        return;
      }

      // --- Regular Medicine Search ---
      setQuery(cleaned);
      setTimeout(() => {
        handleSearch(cleaned);
      }, 400);
    };

    try {
      recognition.start();
    } catch (err) {
      console.error('Could not start recognition:', err);
      recognitionRef.current = null;
      setIsListening(false);
    }
  }

  const popular = lang === 'hi' ? POPULAR_HI : POPULAR_EN;
  const typingWords = lang === 'hi' ? POPULAR_HI : POPULAR_EN;

  // Typewriter effect
  useEffect(() => {
    if (focused || query) return;
    const word = typingWords[typingIdx % typingWords.length];
    const speed = isDeleting ? 40 : 80;
    const timeout = setTimeout(() => {
      setTypedText(prev => {
        if (!isDeleting && prev === word) { setTimeout(() => setIsDeleting(true), 2000); return prev; }
        if (isDeleting && prev === '') { setIsDeleting(false); setTypingIdx(i => i + 1); return ''; }
        return isDeleting ? prev.slice(0, -1) : word.slice(0, prev.length + 1);
      });
    }, speed);
    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, typingIdx, focused, query, lang]);

  function handleSearch(q = query) {
    const term = q.trim();
    if (!term) {
      searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => inputRef.current?.focus(), 400);
      return;
    }
    const history = JSON.parse(localStorage.getItem('medimap_search_history') || '[]');
    const updated = [{ query: term, date: new Date().toISOString() }, ...history.filter(h => h.query !== term)].slice(0, 10);
    localStorage.setItem('medimap_search_history', JSON.stringify(updated));
    navigate(`/results?q=${encodeURIComponent(term)}`);
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }} className="overflow-x-hidden">
      {/* ── HERO SECTION ────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden pt-20 pb-16 rounded-b-[40px] lg:rounded-b-[80px] shadow-2xl z-20">
        {/* Animated Aurora Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#060D1F]" />
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse-glow" style={{ background: 'radial-gradient(circle, #1B6EF3, transparent)' }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse-glow" style={{ background: 'radial-gradient(circle, #00C2A8, transparent)', animationDelay: '2s' }} />
          <div className="absolute top-[40%] left-[20%] w-[40vw] h-[40vw] rounded-full mix-blend-screen filter blur-[90px] opacity-20 animate-pulse-glow" style={{ background: 'radial-gradient(circle, #4B5AE8, transparent)', animationDelay: '4s' }} />
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 w-full flex flex-col items-center text-center">
          
          {/* Premium Badge */}
          <div className="animate-slide-up stagger-1 mb-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold glass-pill text-white shadow-[0_0_20px_rgba(27,110,243,0.3)] border border-white/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span className="opacity-90">{lang === 'hi' ? 'भारत का #1 दवाई कीमत प्लेटफ़ॉर्म' : "India's #1 Medicine Price Platform"}</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="animate-slide-up stagger-2 text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 tracking-tight text-white max-w-5xl">
            {lang === 'hi' ? 'पास में सबसे ' : 'Find Medicines at the '}
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 animate-pulse">
              {lang === 'hi' ? 'सस्ती दवाई' : 'Best Price'}
            </span>
            {lang === 'hi' ? ' खोजें' : ' Near You'}
          </h1>
          <p className="animate-slide-up stagger-3 text-lg sm:text-xl text-blue-100/70 max-w-2xl mb-12 font-medium">
            {lang === 'hi' ? '500+ फार्मेसियों में तुरंत कीमतें तुलना करें। हर पर्ची पर भारी बचत करें।' : 'Compare prices across 500+ pharmacies instantly. Save big on every prescription you fill.'}
          </p>

          {/* Command Center Search */}
          <div ref={searchSectionRef} className="animate-slide-up stagger-4 w-full max-w-3xl mb-10 relative">
            <div className={`relative flex items-center p-2 rounded-2xl sm:rounded-full bg-white/10 backdrop-blur-2xl border transition-all duration-500 ${focused ? 'border-blue-400 shadow-[0_0_40px_rgba(27,110,243,0.4)] bg-white/15' : 'border-white/20 shadow-2xl'}`}>
              
              <div className="pl-6 pr-3">
                <svg className={`w-6 h-6 transition-colors duration-300 ${focused ? 'text-blue-400' : 'text-white/60'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
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
                placeholder={isListening ? (lang === 'hi' ? 'सुन रहा हूँ...' : 'Listening...') : (focused ? (lang === 'hi' ? 'दवाई का नाम लिखें...' : 'Type medicine name...') : (typedText || (lang === 'hi' ? 'दवाई खोजें...' : 'Search medicines...')))}
                className="flex-1 py-4 bg-transparent text-white text-lg sm:text-xl font-medium placeholder-white/50 outline-none w-full"
                disabled={isListening}
              />

              <div className="flex items-center gap-2 pr-2">
                {/* Voice Search Button */}
                <button
                  onClick={toggleListening}
                  className={`p-3 rounded-full transition-all flex items-center justify-center ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                  title={lang === 'hi' ? 'आवाज से खोजें' : 'Voice Search'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                  </svg>
                </button>
                <div className="hidden sm:flex items-center gap-2">
                  <kbd className="hidden md:inline-block px-3 py-1.5 rounded-lg bg-white/10 text-white/60 text-xs font-mono font-semibold border border-white/10">Enter ↵</kbd>
                  <button onClick={() => handleSearch()} className="px-8 py-4 rounded-full font-bold text-white shadow-lg transform transition-transform hover:scale-105 active:scale-95 bg-gradient-to-r from-blue-600 to-teal-500">
                    {lang === 'hi' ? 'खोजें' : 'Search'}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile search button (underneath) */}
            <button onClick={() => handleSearch()} className="sm:hidden mt-3 w-full px-6 py-4 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-blue-600 to-teal-500">
              {lang === 'hi' ? 'खोजें' : 'Search Medicines'}
            </button>

            {/* Quick Chips */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <span className="text-sm text-white/50 font-medium py-1.5">{lang === 'hi' ? 'लोकप्रिय:' : 'Popular:'}</span>
              {popular.map(med => (
                <button key={med} onClick={() => handleSearch(med)} className="px-4 py-1.5 rounded-full text-sm font-medium text-white/80 bg-white/5 hover:bg-white/15 border border-white/10 transition-all hover:scale-105 hover:text-white">
                  {med}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {STATS_DATA.map((s, i) => (
              <div key={i} className={`animate-slide-up stagger-5 glass-panel p-6 rounded-3xl flex flex-col items-center transform transition-transform hover:-translate-y-2 hover:shadow-2xl`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 bg-gradient-to-br ${s.color} shadow-lg`}>
                  {s.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-1 font-sora">{s.value}</div>
                <div className="text-sm text-white/60 font-medium">{lang === 'hi' ? s.hi : s.en}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENTO BOX FEATURES ─────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white relative z-10 -mt-10 pt-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 font-sora tracking-tight">
              {lang === 'hi' ? 'सुपरचार्ज्ड ' : 'Supercharged '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">{lang === 'hi' ? 'सुविधाएं' : 'Features'}</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
              {lang === 'hi' ? 'मेडीमैप को सबसे अलग बनाने वाली शक्तिशाली विशेषताएं' : 'Experience the cutting-edge technology that makes MediMap the best.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES_BENTO.map((f, i) => (
              <div key={i} className={`${f.colSpan} group relative bg-gray-50 rounded-3xl p-8 border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                {/* Glow effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-50 to-teal-50" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl mb-6 border border-gray-100 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                    {f.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 font-sora">{lang === 'hi' ? f.titleHi : f.titleEn}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed flex-grow">{lang === 'hi' ? f.descHi : f.descEn}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center gap-4 flex-wrap">
            <Link to="/scan" className="btn-primary !px-8 !py-4 !text-base !rounded-2xl shadow-xl shadow-blue-500/20">
              <div style={{display:'flex', alignItems:'center', gap:'8px'}}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg> {lang === 'hi' ? 'एआई स्कैनर आजमाएं' : 'Try AI Scanner'}</div>
            </Link>
            <Link to="/map" className="btn-secondary !px-8 !py-4 !text-base !rounded-2xl bg-white">
              <div style={{display:'flex', alignItems:'center', gap:'8px'}}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg> {lang === 'hi' ? 'मैप एक्सप्लोर करें' : 'Explore Map View'}</div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (Timeline) ──────────────────────────────────────── */}
      <section className="py-24 px-4 bg-gray-50 border-t border-gray-100 overflow-hidden relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 font-sora">
              {lang === 'hi' ? 'यह कैसे ' : 'How It '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">{lang === 'hi' ? 'काम करता है' : 'Works'}</span>
            </h2>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-1 bg-gradient-to-r from-blue-200 via-teal-200 to-emerald-200 rounded-full" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative z-10">
              {STEPS_DATA.map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div className="w-24 h-24 rounded-full bg-white shadow-xl border-4 border-gray-50 flex items-center justify-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-teal-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                    {s.step}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 font-sora">{lang === 'hi' ? s.titleHi : s.titleEn}</h3>
                  <p className="text-gray-600 text-lg">{lang === 'hi' ? s.descHi : s.descEn}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-sora text-xl font-bold text-gray-900 mb-6">
            {lang === 'hi' ? 'MediMap पोर्टल्स' : 'MediMap Portals'}
          </h3>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link to="/login" className="px-6 py-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors shadow-sm">
              👤 {lang === 'hi' ? 'यूज़र पोर्टल' : 'User Portal'}
            </Link>
            <Link to="/login" className="px-6 py-3 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 font-bold hover:bg-teal-100 transition-colors shadow-sm">
              🏥 {lang === 'hi' ? 'फार्मासिस्ट पोर्टल' : 'Pharmacist Portal'}
            </Link>
            <Link to="/admin" className="px-6 py-3 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 transition-colors shadow-sm">
              🛡️ {lang === 'hi' ? 'एडमिन पोर्टल' : 'Admin Portal'}
            </Link>
          </div>
          <p className="text-gray-500 text-sm font-medium">
            © {new Date().getFullYear()} MediMap · {lang === 'hi' ? 'हर भारतीय के लिए स्वास्थ्य सेवा को सस्ता बनाना 🇮🇳' : 'Making Healthcare Affordable for Every Indian 🇮🇳'}
          </p>
        </div>
      </footer>
    </div>
  );
}
