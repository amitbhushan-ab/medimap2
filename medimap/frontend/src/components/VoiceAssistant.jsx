// src/components/VoiceAssistant.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [supported, setSupported] = useState(true);
  const [waitingForMedicine, setWaitingForMedicine] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false);
    }
  }, []);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  };

  const processCommand = (text) => {
    // Normalize — lowercase, remove punctuation
    const lower = text.toLowerCase().trim().replace(/[.,!?]/g, '');
    console.log('Voice command received:', lower); // for debugging

    setTranscript(text);

    // If waiting for medicine name
    if (waitingForMedicine) {
      setWaitingForMedicine(false);
      const msg = lang === 'hi' ? `${text} खोज रहे हैं...` : `Searching for ${text}...`;
      setResponse(msg);
      speak(msg);
      setTimeout(() => navigate(`/results?q=${encodeURIComponent(text)}`), 1000);
      return;
    }

    // ── Navigation commands ─────────────────────────────────────────────────

    // HOME
    if (lower.match(/\b(home|homepage|main page|होम|होम पेज|मुख्य पेज)\b/)) {
      const msg = lang === 'hi' ? 'होम पेज पर जा रहे हैं!' : 'Going to home page!';
      setResponse(msg); speak(msg);
      setTimeout(() => navigate('/'), 800);
      return;
    }

    // MAP
    if (lower.match(/\b(map|maps|show map|open map|map view|नक्शा|मैप|मैप खोलो|नक्शा दिखाओ)\b/)) {
      const msg = lang === 'hi' ? 'मैप खोल रहे हैं!' : 'Opening map view!';
      setResponse(msg); speak(msg);
      setTimeout(() => navigate('/map'), 800);
      return;
    }

    // SCAN
    if (lower.match(/\b(scan|prescription|scan prescription|rx|स्कैन|पर्ची|पर्ची स्कैन)\b/)) {
      const msg = lang === 'hi' ? 'पर्ची स्कैनर खोल रहे हैं!' : 'Opening prescription scanner!';
      setResponse(msg); speak(msg);
      setTimeout(() => navigate('/scan'), 800);
      return;
    }

    // SUBMIT PRICE
    if (lower.match(/\b(submit|price|update price|submit price|कीमत|जमा|कीमत जमा)\b/)) {
      const msg = lang === 'hi' ? 'कीमत जमा करने का पेज खोल रहे हैं!' : 'Opening price submission!';
      setResponse(msg); speak(msg);
      setTimeout(() => navigate('/submit-price'), 800);
      return;
    }

    // HELP
    if (lower.match(/\b(help|what can you do|commands|मदद|सहायता|क्या)\b/)) {
      const msg = lang === 'hi'
        ? 'आप कह सकते हैं: पैरासिटामोल खोजो, मैप खोलो, पर्ची स्कैन करो, होम जाओ।'
        : 'Say: search paracetamol, open map, scan prescription, go home, or submit price.';
      setResponse(msg); speak(msg);
      return;
    }

    // SEARCH with medicine name inline e.g. "search paracetamol"
    const searchMatch = lower.match(/(?:search|find|look for|खोजो|ढूंढो)\s+(.+)/);
    if (searchMatch && searchMatch[1]) {
      const medicine = searchMatch[1].trim();
      const msg = lang === 'hi' ? `${medicine} खोज रहे हैं...` : `Searching for ${medicine}...`;
      setResponse(msg); speak(msg);
      setTimeout(() => navigate(`/results?q=${encodeURIComponent(medicine)}`), 1000);
      return;
    }

    // SEARCH alone — ask what to search
    if (lower.match(/\b(search|find|खोजो|ढूंढो)\b/)) {
      const msg = lang === 'hi' ? 'कौन सी दवाई खोजनी है?' : 'What medicine to search?';
      setResponse(msg); speak(msg);
      setWaitingForMedicine(true);
      setTimeout(() => startListening(), 2000);
      return;
    }

    // If none matched — treat entire phrase as medicine search
    const fallbackMsg = lang === 'hi'
      ? `${text} खोज रहे हैं...`
      : `Searching for ${text}...`;
    setResponse(fallbackMsg);
    speak(fallbackMsg);
    setTimeout(() => navigate(`/results?q=${encodeURIComponent(text)}`), 1000);
  };

  const startListening = () => {
    if (!supported) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => { setIsListening(true); setTranscript(''); setResponse(''); };
    recognition.onresult = (e) => { processCommand(e.results[0][0].transcript); };
    recognition.onerror = (e) => { console.error('Speech error:', e.error); setIsListening(false); };
    recognition.onend = () => { setIsListening(false); };
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  if (!supported) return null;

  return (
    <>
      {/* Floating mic button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
        style={{
          background: isListening
            ? 'linear-gradient(135deg, #ff4444, #ff0000)'
            : 'linear-gradient(135deg, #2E7DFF, #00C2A8)',
          boxShadow: isListening
            ? '0 0 0 8px rgba(255,68,68,0.2)'
            : '0 0 0 4px rgba(46,125,255,0.15)',
        }}
      >
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2E7DFF] to-[#00C2A8] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎙️</span>
              <div>
                <p className="font-bold text-sm">{lang === 'hi' ? 'MediMap सहायक' : 'MediMap Assistant'}</p>
                <p className="text-xs text-white/70">{lang === 'hi' ? 'आवाज़ से नियंत्रण करें' : 'Voice navigation'}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">✕</button>
          </div>

          <div className="p-4">
            {/* Status box */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4 min-h-[80px] flex flex-col items-center justify-center text-center">
              {isListening ? (
                <>
                  <div className="flex items-end gap-1 mb-2 h-8">
                    {[2,4,6,8,6,4,2].map((h, i) => (
                      <div key={i} className="w-1.5 rounded-full bg-[#2E7DFF]"
                        style={{ height: `${h * 3}px`, animation: `wave ${0.4 + i*0.1}s ease-in-out infinite alternate` }} />
                    ))}
                  </div>
                  <p className="text-sm text-[#2E7DFF] font-semibold">
                    {lang === 'hi' ? 'सुन रहा हूँ...' : 'Listening...'}
                  </p>
                </>
              ) : transcript ? (
                <>
                  <p className="text-xs text-gray-400 mb-1">{lang === 'hi' ? 'आपने कहा:' : 'You said:'}</p>
                  <p className="text-sm font-semibold text-gray-800">"{transcript}"</p>
                </>
              ) : (
                <p className="text-sm text-gray-400">
                  {lang === 'hi' ? 'नीचे बटन दबाकर बोलें' : 'Press Speak and say a command'}
                </p>
              )}
            </div>

            {/* Response */}
            {response && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
                <p className="text-sm text-[#2E7DFF] font-medium">🤖 {response}</p>
              </div>
            )}

            {/* Mic button */}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${
                isListening ? 'bg-red-500 text-white' : 'bg-gradient-to-r from-[#2E7DFF] to-[#00C2A8] text-white'
              }`}
            >
              {isListening
                ? (lang === 'hi' ? '⏹ रोकें' : '⏹ Stop')
                : (lang === 'hi' ? '🎙️ बोलें' : '🎙️ Speak')}
            </button>

            {/* Example commands */}
            <div className="mt-4">
              <p className="text-xs text-gray-400 font-medium mb-2">
                {lang === 'hi' ? '💡 उदाहरण:' : '💡 Try saying:'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(lang === 'hi'
                  ? ['पैरासिटामोल खोजो', 'मैप खोलो', 'पर्ची स्कैन करो', 'होम जाओ', 'मदद']
                  : ['Search Paracetamol', 'Open map', 'Scan prescription', 'Go home', 'Help']
                ).map(cmd => (
                  <span key={cmd} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full cursor-pointer hover:bg-blue-50 hover:text-[#2E7DFF]">
                    {cmd}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes wave {
          from { transform: scaleY(0.5); }
          to { transform: scaleY(1.5); }
        }
      `}</style>
    </>
  );
}
