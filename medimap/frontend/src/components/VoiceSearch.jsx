// frontend/src/components/VoiceSearch.jsx
// FIX #3: Show live transcript while listening, clear visual feedback, auto-search on result
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

const MEDICINES_EN = ['paracetamol','ibuprofen','amoxicillin','metformin','atorvastatin','cetirizine','aspirin','azithromycin','pantoprazole','omeprazole','levothyroxine','crocin','dolo','combiflam'];
const MEDICINES_HI = ['पैरासिटामोल','मेटफॉर्मिन','सिट्रीज़िन','एज़िथ्रोमाइसिन','एस्पिरिन','ओमेप्राज़ोल'];

export default function VoiceSearch() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const [state, setState] = useState('idle'); // idle | listening | processing | success | error
  const [liveText, setLiveText] = useState('');   // live interim text while speaking
  const [finalText, setFinalText] = useState(''); // confirmed final text
  const [supported, setSupported] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    setSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  function extractMedicine(text) {
    const lower = text.toLowerCase().trim();
    const allMeds = [...MEDICINES_EN, ...MEDICINES_HI];
    for (const med of allMeds) {
      if (lower.includes(med.toLowerCase())) return med;
    }
    // Strip command words
    const cleaned = lower
      .replace(/search|find|look for|where|show me|i need|do you have|मुझे|दिखाओ|खोजो|ढूंढो|चाहिए/gi, '')
      .replace(/\s+/g, ' ').trim();
    return cleaned || text.trim();
  }

  function startListening() {
    if (!supported || state === 'listening') return;
    setState('listening');
    setLiveText('');
    setFinalText('');
    setShowPanel(true);

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognitionRef.current = recognition;
    // FIX #3: Hindi + English
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true; // FIX #3: show live text as user speaks

    recognition.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      // FIX #3: show what is being heard in real time
      setLiveText(final || interim);

      if (final) {
        setFinalText(final);
        setState('processing');
        const medicine = extractMedicine(final);
        setTimeout(() => {
          setState('success');
          setTimeout(() => {
            navigate(`/results?q=${encodeURIComponent(medicine)}`);
            setState('idle');
            setLiveText('');
            setFinalText('');
            setShowPanel(false);
          }, 800);
        }, 300);
      }
    };

    recognition.onerror = (e) => {
      console.error('Speech error:', e.error);
      setState('error');
      setLiveText('');
      setTimeout(() => {
        setState('idle');
        setShowPanel(false);
      }, 2500);
    };

    recognition.onend = () => {
      if (state === 'listening' && !finalText) {
        setState('idle');
        setShowPanel(false);
      }
    };

    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setState('idle');
    setShowPanel(false);
    setLiveText('');
  }

  if (!supported) return null;

  const colors = { idle:'#1B6EF3', listening:'#ef4444', processing:'#f79009', success:'#12B76A', error:'#ef4444' };
  const labels = {
    idle: lang === 'hi' ? 'वॉयस सर्च' : 'Voice Search',
    listening: lang === 'hi' ? 'सुन रहे हैं...' : 'Listening...',
    processing: lang === 'hi' ? 'खोज रहे हैं...' : 'Searching...',
    success: lang === 'hi' ? 'मिल गया!' : 'Found!',
    error: lang === 'hi' ? 'फिर कोशिश करें' : 'Try again',
  };

  return (
    <>
      {/* Floating mic button */}
      <button
        onClick={state === 'listening' ? stopListening : startListening}
        title={labels[state]}
        style={{
          position: 'fixed', bottom: 92, right: 24, zIndex: 999,
          width: 48, height: 48, borderRadius: '50%',
          background: colors[state],
          border: 'none', cursor: 'pointer', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: state === 'listening'
            ? '0 0 0 10px rgba(239,68,68,0.15), 0 0 0 20px rgba(239,68,68,0.06)'
            : '0 4px 16px rgba(27,110,243,0.35)',
          transition: 'all 0.3s ease',
        }}>
        {state === 'idle' && (
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z"/>
          </svg>
        )}
        {state === 'listening' && (
          // Animated mic icon
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="9" y="3" width="6" height="14" rx="3"/>
            <path d="M5 11v1a7 7 0 0014 0v-1"/>
          </svg>
        )}
        {state === 'processing' && (
          <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        )}
        {state === 'success' && (
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
        )}
        {state === 'error' && (
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        )}
      </button>

      {/* FIX #3: Live panel showing what is being heard */}
      {showPanel && (
        <div style={{
          position: 'fixed', bottom: 152, right: 24, zIndex: 998,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '14px 18px', minWidth: 220, maxWidth: 280,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          animation: 'slideInVoice 0.2s ease',
        }}>
          {/* Status label */}
          <div className="flex items-center gap-2 mb-2">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[state], flexShrink: 0,
              animation: state === 'listening' ? 'pulseDot 1s ease-in-out infinite' : 'none' }}/>
            <span style={{ fontSize: 12, fontWeight: 600, color: colors[state] }}>{labels[state]}</span>
          </div>

          {/* FIX #3: Live transcript text */}
          {liveText ? (
            <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 4 }}>
              "{liveText}"
            </div>
          ) : state === 'listening' ? (
            // Waveform animation while waiting for speech
            <div className="flex items-center gap-1 h-6">
              {[0.6, 1, 0.8, 1.2, 0.7, 1.1, 0.9].map((h, i) => (
                <div key={i} style={{
                  width: 3, borderRadius: 2,
                  background: '#ef4444', opacity: 0.7,
                  animation: `wave ${0.8 + i * 0.1}s ease-in-out ${i * 0.08}s infinite`,
                  height: `${h * 12}px`,
                }}/>
              ))}
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>
                {lang === 'hi' ? 'बोलें...' : 'Speak now...'}
              </span>
            </div>
          ) : null}

          {state === 'error' && (
            <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
              {lang === 'hi' ? 'कुछ सुना नहीं। फिर कोशिश करें।' : 'Could not hear. Try again.'}
            </p>
          )}

          {/* Tip */}
          {state === 'listening' && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              {lang === 'hi' ? 'दवाई का नाम बोलें' : 'Say a medicine name'}
            </p>
          )}

          {/* Stop button */}
          {state === 'listening' && (
            <button onClick={stopListening}
              style={{ marginTop: 10, width: '100%', padding: '6px', borderRadius: 8, background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              {lang === 'hi' ? '✕ रोकें' : '✕ Stop'}
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes wave { 0%,100%{transform:scaleY(0.5)} 50%{transform:scaleY(1.5)} }
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slideInVoice { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </>
  );
}
