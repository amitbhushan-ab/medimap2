// frontend/src/components/ChatBot.jsx — FIXED: working Groq API
import { useState, useRef, useEffect } from 'react';
import { useLang } from '../context/LanguageContext';

const SUGGESTIONS_EN = ['Paracetamol generic?', 'Nearest open pharmacy?', 'Azithromycin side effects?'];
const SUGGESTIONS_HI = ['पैरासिटामोल का जेनेरिक?', 'पास की खुली फार्मेसी?', 'एज़िथ्रोमाइसिन के साइड इफेक्ट?'];

function TypingIndicator() {
  return (
    <div style={{ display:'flex', gap:4, padding:'10px 14px', alignItems:'center' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'#2E7DFF', animation:`mmBounce 1.2s ease-in-out ${i*0.2}s infinite` }}/>
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isBot = msg.role === 'assistant';
  return (
    <div style={{ display:'flex', justifyContent:isBot?'flex-start':'flex-end', marginBottom:10 }}>
      {isBot && (
        <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#1B6EF3,#00C2A8)', display:'flex', alignItems:'center', justifyContent:'center', marginRight:8, flexShrink:0 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white"/>
          </svg>
        </div>
      )}
      <div style={{
        maxWidth:'78%', padding:'10px 14px',
        borderRadius:isBot?'4px 16px 16px 16px':'16px 4px 16px 16px',
        background:isBot?'var(--bg-card)':'linear-gradient(135deg,#1B6EF3,#1a6aef)',
        color:isBot?'var(--text-primary)':'white',
        border:isBot?'1px solid var(--border)':'none',
        boxShadow:'0 1px 4px rgba(0,0,0,0.08)',
        fontSize:13, lineHeight:1.55, whiteSpace:'pre-wrap'
      }}>
        {msg.content}
      </div>
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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const suggestions = lang === 'hi' ? SUGGESTIONS_HI : SUGGESTIONS_EN;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, loading]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role:'assistant',
        content: lang === 'hi'
          ? 'नमस्ते! 👋 मैं MediMap का AI असिस्टेंट हूँ। दवाइयों की जानकारी, साइड इफेक्ट, जेनेरिक विकल्प — सब पूछ सकते हैं!'
          : 'Hello! 👋 I\'m MediMap\'s AI assistant. Ask me about medicines, side effects, generic alternatives, or nearby pharmacies!'
      }]);
    }
  }, [open, lang]);

  async function sendMessage(text) {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput(''); setError('');

    const userMsg = { role:'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('https://medimap-backend-production.up.railway.app/api/chat', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body:JSON.stringify({ messages: newMessages, lang, userLocation }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages(prev => [...prev, { role:'assistant', content: data.reply || data.message || 'Sorry, no response.' }]);
    } catch (err) {
      setError(err.message);
      setMessages(prev => [...prev, { role:'assistant', content: lang === 'hi' ? 'माफ़ करें, कुछ गलत हुआ। फिर कोशिश करें।' : 'Sorry, something went wrong. Please try again.' }]);
    }
    setLoading(false);
  }

  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    r.interimResults = false;
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onresult = e => sendMessage(e.results[0][0].transcript);
    r.onerror = () => setListening(false);
    recognitionRef.current = r;
    r.start();
  }

  function clearChat() {
    setMessages([]);
    setError('');
    setTimeout(() => setOpen(o => { if (o) setMessages([{ role:'assistant', content: lang === 'hi' ? 'नमस्ते! फिर से पूछें।' : 'Hello! Ask me anything.' }]); return o; }), 100);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        style={{ position:'fixed', bottom:24, right:24, zIndex:1000, width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg,#1B6EF3,#00C2A8)', border:'none', cursor:'pointer', boxShadow:'0 4px 20px rgba(27,110,243,0.4)', display:'flex', alignItems:'center', justifyContent:'center', transition:'transform 0.2s', transform:open?'scale(0.9)':'scale(1)' }}
        title="MediMap AI Assistant">
        {open
          ? <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          : <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white"/><path d="M9 8h6M9 11h4" stroke="rgba(27,110,243,0.8)" strokeWidth="1.5" strokeLinecap="round"/></svg>
        }
        {/* Unread badge */}
        {!open && messages.length === 0 && (
          <div style={{ position:'absolute', top:-2, right:-2, width:14, height:14, borderRadius:'50%', background:'#12B76A', border:'2px solid white' }}/>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position:'fixed', bottom:90, right:24, zIndex:999,
          width:360, maxWidth:'calc(100vw - 48px)',
          borderRadius:20, overflow:'hidden',
          background:'var(--bg-card)', border:'1px solid var(--border)',
          boxShadow:'0 20px 60px rgba(0,0,0,0.2)',
          display:'flex', flexDirection:'column', height:520,
          animation:'slideUp 0.25s cubic-bezier(0.16,1,0.3,1)',
        }}>
          {/* Header */}
          <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid var(--border)', background:'linear-gradient(135deg, rgba(27,110,243,0.08), rgba(0,194,168,0.05))' }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#1B6EF3,#00C2A8)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white"/></svg>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:14, color:'var(--text-primary)', fontFamily:'Sora, sans-serif' }}>MediMap AI</div>
              <div style={{ fontSize:11, color:'#12B76A', display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#12B76A' }}/>
                {lang === 'hi' ? 'ऑनलाइन' : 'Online'}
              </div>
            </div>
            <button onClick={clearChat} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:12, padding:'4px 8px', borderRadius:6 }}>
              {lang === 'hi' ? 'साफ़ करें' : 'Clear'}
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'12px 16px' }}>
            {messages.map((msg, i) => <Message key={i} msg={msg}/>)}
            {loading && (
              <div style={{ display:'flex', justifyContent:'flex-start', marginBottom:10 }}>
                <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#1B6EF3,#00C2A8)', display:'flex', alignItems:'center', justifyContent:'center', marginRight:8 }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white"/></svg>
                </div>
                <TypingIndicator/>
              </div>
            )}
            {error && <div style={{ fontSize:12, color:'#dc2626', background:'#fef2f2', padding:'8px 12px', borderRadius:10, marginBottom:10 }}>⚠️ {error}</div>}
            <div ref={messagesEndRef}/>
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={{ padding:'8px 16px', display:'flex', gap:6, flexWrap:'wrap' }}>
              {suggestions.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  style={{ fontSize:11, padding:'5px 10px', borderRadius:999, background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text-secondary)', cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e => { e.target.style.borderColor='#1B6EF3'; e.target.style.color='#1B6EF3'; }}
                  onMouseLeave={e => { e.target.style.borderColor='var(--border)'; e.target.style.color='var(--text-secondary)'; }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding:'10px 16px', borderTop:'1px solid var(--border)', display:'flex', gap:8, alignItems:'center' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={lang === 'hi' ? 'दवाई के बारे में पूछें...' : 'Ask about medicines...'}
              style={{ flex:1, padding:'9px 14px', borderRadius:12, border:'1.5px solid var(--border)', background:'var(--bg-subtle)', color:'var(--text-primary)', fontSize:13, outline:'none', fontFamily:'DM Sans, sans-serif' }}
            />
            <button onClick={startVoice}
              style={{ width:36, height:36, borderRadius:10, border:'1.5px solid var(--border)', background:listening?'#fee2e2':'var(--bg-card)', color:listening?'#dc2626':'var(--text-muted)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z"/></svg>
            </button>
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
              style={{ width:36, height:36, borderRadius:10, background:input.trim()&&!loading?'linear-gradient(135deg,#1B6EF3,#00C2A8)':'var(--border)', border:'none', color:input.trim()&&!loading?'white':'var(--text-muted)', cursor:input.trim()&&!loading?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes mmBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </>
  );
}
