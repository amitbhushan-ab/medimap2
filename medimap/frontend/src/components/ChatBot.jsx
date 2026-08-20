// frontend/src/components/ChatBot.jsx — Premium AI Chat UI
import { useState, useRef, useEffect } from 'react';
import { useLang } from '../context/LanguageContext';

const SUGGESTIONS_EN = [
  'Paracetamol generic alternative?',
  'Azithromycin side effects?',
  'Metformin dosage info?',
  'Nearest open pharmacy?',
];
const SUGGESTIONS_HI = [
  'पैरासिटामोल का जेनेरिक विकल्प?',
  'एज़िथ्रोमाइसिन के साइड इफेक्ट?',
  'मेटफॉर्मिन की खुराक जानकारी?',
  'पास की खुली फार्मेसी?',
];

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '12px 16px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: '#2E7DFF',
          animation: `mmBounce 1.2s ease-in-out ${i * 0.2}s infinite`
        }} />
      ))}
    </div>
  );
}

function BotAvatar({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #1B6EF3, #00C2A8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, boxShadow: '0 2px 8px rgba(27,110,243,0.3)'
    }}>
      <svg width={size * 0.45} height={size * 0.45} fill="white" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>
    </div>
  );
}

function Message({ msg }) {
  const isBot = msg.role === 'assistant';
  return (
    <div style={{
      display: 'flex',
      justifyContent: isBot ? 'flex-start' : 'flex-end',
      alignItems: 'flex-end',
      gap: 8,
      marginBottom: 14,
    }}>
      {isBot && <BotAvatar size={28} />}
      <div style={{ maxWidth: '76%', display: 'flex', flexDirection: 'column', gap: 3, alignItems: isBot ? 'flex-start' : 'flex-end' }}>
        <div style={{
          padding: '10px 14px',
          borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
          background: isBot ? 'white' : 'linear-gradient(135deg, #1B6EF3, #0ea5e9)',
          color: isBot ? '#1a202c' : 'white',
          border: isBot ? '1px solid #e8edf5' : 'none',
          boxShadow: isBot ? '0 2px 8px rgba(0,0,0,0.06)' : '0 2px 12px rgba(27,110,243,0.3)',
          fontSize: 13.5,
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          fontFamily: 'DM Sans, sans-serif',
        }}>
          {msg.content}
        </div>
        <span style={{ fontSize: 10, color: '#9ca3af' }}>{msg.time}</span>
      </div>
      {!isBot && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: 12, color: 'white', fontWeight: 700
        }}>U</div>
      )}
    </div>
  );
}

export default function ChatBot({ userLocation }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const [pulse, setPulse] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const suggestions = lang === 'hi' ? SUGGESTIONS_HI : SUGGESTIONS_EN;

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 6000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: lang === 'hi'
          ? 'नमस्ते! 👋 मैं MediMap AI हूँ।\n\nदवाइयों की जानकारी, साइड इफेक्ट, जेनेरिक विकल्प — कुछ भी पूछें!'
          : 'Hello! 👋 I\'m MediMap AI.\n\nAsk me about medicines, side effects, generic alternatives, dosage, or nearby pharmacies!',
        time: formatTime(new Date()),
      }]);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, lang]);

  async function sendMessage(text) {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');
    setError('');

    const userMsg = { role: 'user', content, time: formatTime(new Date()) };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('https://medimap-backend-ygqj.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          lang,
          userLocation,
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || data.message || (lang === 'hi' ? 'कोई उत्तर नहीं मिला।' : 'No response received.'),
        time: formatTime(new Date()),
      }]);
    } catch (err) {
      const isNetwork = err.message.includes('fetch') || err.message.includes('Failed') || err.message.includes('NetworkError');
      setError(isNetwork
        ? (lang === 'hi' ? 'सर्वर से कनेक्ट नहीं हो सका। 10 सेकंड बाद फिर कोशिश करें।' : 'Could not reach server — it may be waking up. Try again in ~10s.')
        : err.message
      );
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: lang === 'hi'
          ? 'माफ़ करें, कुछ गलत हुआ। थोड़ी देर बाद फिर कोशिश करें।'
          : 'Sorry, something went wrong. The server may be starting up — please try again shortly.',
        time: formatTime(new Date()),
      }]);
    }
    setLoading(false);
  }

  function startVoice() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    r.interimResults = false;
    r.continuous = false;
    recognitionRef.current = r;
    r.onstart = () => setListening(true);
    r.onend = () => { recognitionRef.current = null; setListening(false); };
    r.onresult = e => {
      const text = e.results[0][0].transcript;
      setInput(text);
      setTimeout(() => sendMessage(text), 100);
    };
    r.onerror = () => { recognitionRef.current = null; setListening(false); };
    try { r.start(); } catch { recognitionRef.current = null; setListening(false); }
  }

  function clearChat() {
    setMessages([{
      role: 'assistant',
      content: lang === 'hi' ? 'नमस्ते! फिर से पूछें।' : 'Hello again! How can I help?',
      time: formatTime(new Date()),
    }]);
    setError('');
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => { setOpen(o => !o); setPulse(false); }}
        style={{
          position: 'fixed', bottom: 88, right: 24, zIndex: 1000,
          width: 52, height: 52, borderRadius: '50%',
          background: open ? '#374151' : 'linear-gradient(135deg, #1B6EF3, #00C2A8)',
          border: 'none', cursor: 'pointer',
          boxShadow: open ? '0 4px 16px rgba(0,0,0,0.2)' : '0 4px 20px rgba(27,110,243,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          transform: open ? 'scale(0.92) rotate(90deg)' : 'scale(1)',
        }}
        title="MediMap AI Chat"
      >
        {open
          ? <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          : <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
        }
        {!open && pulse && (
          <span style={{
            position: 'absolute', top: -3, right: -3,
            width: 13, height: 13, borderRadius: '50%',
            background: '#22c55e', border: '2px solid white',
            animation: 'pulseBadge 1.5s ease-in-out infinite',
          }} />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 152, right: 24, zIndex: 999,
          width: 370, maxWidth: 'calc(100vw - 32px)',
          borderRadius: 20, overflow: 'hidden',
          background: '#f8fafd', border: '1px solid #e2e8f0',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(27,110,243,0.1)',
          display: 'flex', flexDirection: 'column', height: 540,
          animation: 'chatSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}>

          {/* Header */}
          <div style={{
            padding: '13px 14px',
            background: 'linear-gradient(135deg, #1B6EF3 0%, #00C2A8 100%)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <BotAvatar size={38} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'white', fontFamily: 'Sora, sans-serif' }}>
                MediMap AI
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#86efac' }} />
                {lang === 'hi' ? 'ऑनलाइन · तुरंत जवाब' : 'Online · Instant replies'}
              </div>
            </div>
            {messages.length > 1 && (
              <button onClick={clearChat} style={{
                background: 'rgba(255,255,255,0.18)', border: 'none', cursor: 'pointer',
                color: 'white', fontSize: 11, padding: '4px 10px', borderRadius: 8, fontWeight: 600,
              }}>
                {lang === 'hi' ? 'साफ़' : 'Clear'}
              </button>
            )}
            <button onClick={() => setOpen(false)} style={{
              background: 'rgba(255,255,255,0.18)', border: 'none', cursor: 'pointer',
              color: 'white', width: 28, height: 28, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px',
            background: '#f1f5f9',
          }}>
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 14 }}>
                <BotAvatar size={28} />
                <div style={{ background: 'white', border: '1px solid #e8edf5', borderRadius: '4px 16px 16px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <TypingDots />
                </div>
              </div>
            )}
            {error && (
              <div style={{
                fontSize: 12, color: '#dc2626', background: '#fff5f5',
                border: '1px solid #fecaca', padding: '8px 12px', borderRadius: 10, marginBottom: 10,
                display: 'flex', gap: 6, alignItems: 'flex-start',
              }}>
                <svg width="14" height="14" fill="#dc2626" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={{ padding: '10px 14px 6px', background: '#f8fafd', borderTop: '1px solid #e8edf5' }}>
              <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 7, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {lang === 'hi' ? 'सुझाव' : 'Quick questions'}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {suggestions.map(s => (
                  <button key={s} onClick={() => sendMessage(s)} style={{
                    fontSize: 11.5, padding: '5px 11px', borderRadius: 999,
                    background: 'white', border: '1.5px solid #e2e8f0',
                    color: '#475569', cursor: 'pointer', transition: 'all 0.15s',
                    fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#1B6EF3'; e.currentTarget.style.color = '#1B6EF3'; e.currentTarget.style.background = '#eff6ff'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'white'; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 14px 14px', background: '#f8fafd', borderTop: '1px solid #e8edf5', display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={lang === 'hi' ? 'दवाई के बारे में पूछें...' : 'Ask about medicines...'}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 14,
                border: '1.5px solid #e2e8f0', background: 'white',
                color: '#1a202c', fontSize: 13, outline: 'none',
                fontFamily: 'DM Sans, sans-serif',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
              onFocus={e => e.target.style.borderColor = '#1B6EF3'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <button onClick={startVoice} style={{
              width: 38, height: 38, borderRadius: 12, flexShrink: 0,
              border: '1.5px solid ' + (listening ? '#fca5a5' : '#e2e8f0'),
              background: listening ? '#fef2f2' : 'white',
              color: listening ? '#dc2626' : '#64748b',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: listening ? '0 0 0 3px rgba(220,38,38,0.15)' : 'none',
            }}>
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z"/>
              </svg>
            </button>
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{
              width: 38, height: 38, borderRadius: 12, flexShrink: 0,
              background: input.trim() && !loading ? 'linear-gradient(135deg, #1B6EF3, #00C2A8)' : '#e2e8f0',
              border: 'none',
              color: input.trim() && !loading ? 'white' : '#94a3b8',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: input.trim() && !loading ? '0 2px 8px rgba(27,110,243,0.35)' : 'none',
            }}>
              {loading
                ? <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                  </svg>
                : <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
              }
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes mmBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes chatSlideUp { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes pulseBadge { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.35);opacity:0.7} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </>
  );
}

