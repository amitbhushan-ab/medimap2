// frontend/src/pages/Aboutpage.jsx — Modern Futuristic UI
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const TEAM = [
  { name:'Amit Bhushan', role:'Founder', emoji:'👨‍💼', desc:'Frustrated with medicine price inequality, built MediMap in 2026' },
  { name:'Dhanveen Mehta', role:'Head of Technology & CTO', emoji:'👩‍💻', desc:'Full-stack engineer passionate about healthtech for Bharat' },
  { name:'Mayank Bedi', role:'Operations Lead & COO', emoji:'🧑‍💼', desc:'Driving operational excellence and ensuring seamless execution across MediMaps.' },
  { name:'Parul Singh', role:'Design Lead & CEO ', emoji:'👩‍🎨', desc:'Creating beautiful, experiences for every Indian and Steering MediMaps with vision, innovation, and purpose' },
];

const STATS = [
  { value:'500+', label:'Partner Pharmacies', icon:'🏥' },
  { value:'2,000+', label:'Medicines Tracked', icon:'💊' },
  { value:'10,000+', label:'Indians Served', icon:'🇮🇳' },
  { value:'₹340', label:'Average Monthly Savings', icon:'💰' },
  { value:'4.9/5', label:'User Rating', icon:'⭐' },
  { value:'15+', label:'Cities Covered', icon:'🗺️' },
];

const TIMELINE = [
  { year:'2024', title:'The Problem', desc:'Founders notice medicine prices vary 300% across pharmacies in the same city' },
  { year:'Jan 2025', title:'MediMap Born', desc:'First version launched in Faridabad with 50 pharmacies' },
  { year:'Mar 2025', title:'AI Integration', desc:'Added prescription OCR, voice search, and AI chatbot' },
  { year:'Jun 2025', title:'Pharmacist Portal', desc:'Launched premium dashboard for pharmacy owners' },
  { year:'2026 →', title:'Pan India', desc:'Expanding to 100+ cities with real-time price updates' },
];

const MISSION_CARDS = [
  { icon:'💊', title:'Affordable Healthcare', desc:'We believe no Indian should overpay for medicines due to lack of information', color:'from-emerald-500 to-teal-500' },
  { icon:'🔍', title:'Price Transparency', desc:'Real-time comparison across every registered pharmacy near you', color:'from-blue-500 to-cyan-500' },
  { icon:'🤝', title:'Pharmacy Partners', desc:'Empowering local pharmacists with digital tools to compete and grow', color:'from-purple-500 to-pink-500' },
  { icon:'🇮🇳', title:'Built for Bharat', desc:'Hindi + English, voice search, prescription OCR — designed for every Indian', color:'from-orange-500 to-amber-500' },
];

export default function AboutPage() {
  const [count, setCount] = useState({ ph:0, med:0, users:0 });
  useEffect(() => {
    // Animate counters
    const targets = { ph:500, med:2000, users:10000 };
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const progress = Math.min(frame/60, 1);
      const ease = 1 - Math.pow(1-progress, 3);
      setCount({ ph:Math.round(targets.ph*ease), med:Math.round(targets.med*ease), users:Math.round(targets.users*ease) });
      if (progress >= 1) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor:'var(--bg-primary)', paddingTop:64 }}>

      {/* ── HERO ── */}
      <section style={{ position:'relative', overflow:'hidden', minHeight:480, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'80px 24px' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(145deg, #060D1F 0%, #0B1628 50%, #080F1A 100%)' }}/>
        <div style={{ position:'absolute', top:'20%', left:'15%', width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.2), transparent)', filter:'blur(40px)', animation:'floatA 4s ease-in-out infinite' }}/>
        <div style={{ position:'absolute', bottom:'20%', right:'15%', width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(27,110,243,0.2), transparent)', filter:'blur(30px)', animation:'floatA 4s ease-in-out 2s infinite' }}/>
        <div style={{ position:'absolute', inset:0, opacity:0.04, backgroundImage:'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize:'28px 28px' }}/>

        <div style={{ position:'relative', zIndex:10 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 20px', borderRadius:999, background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', color:'#34d399', fontSize:13, fontWeight:600, marginBottom:24 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', animation:'pulse 1.5s ease-in-out infinite' }}/>
            Our Mission
          </div>

          <h1 style={{ fontFamily:'Sora, sans-serif', fontSize:'clamp(32px, 5vw, 60px)', fontWeight:900, color:'white', margin:'0 0 20px', lineHeight:1.15, letterSpacing:'-0.03em' }}>
            Making Medicine <br/>
            <span style={{ background:'linear-gradient(135deg, #10b981, #1B6EF3)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Affordable for Every Indian
            </span>
          </h1>

          <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'clamp(15px, 2vw, 18px)', maxWidth:600, margin:'0 auto 36px', lineHeight:1.7 }}>
            MediMap started with a simple question: why does the same medicine cost 3× more at one pharmacy vs. another 500m away?
          </p>

          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/">
              <button style={{ padding:'14px 32px', borderRadius:999, border:'none', background:'linear-gradient(135deg,#10b981,#059669)', color:'white', fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:15, cursor:'pointer', boxShadow:'0 4px 20px rgba(16,185,129,0.4)' }}>🔍 Search Medicines</button>
            </Link>
            <Link to="/signup">
              <button style={{ padding:'14px 32px', borderRadius:999, border:'1.5px solid rgba(255,255,255,0.25)', background:'rgba(255,255,255,0.08)', color:'white', fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:15, cursor:'pointer', backdropFilter:'blur(10px)' }}>Join Free →</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── ANIMATED STATS ── */}
      <section style={{ padding:'64px 24px', background:'var(--bg-primary)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap:16 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, padding:'24px 20px', textAlign:'center', transition:'all 0.3s' }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
              <div style={{ fontSize:28, marginBottom:10 }}>{s.icon}</div>
              <div style={{ fontFamily:'Sora,sans-serif', fontSize:26, fontWeight:800, color:'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION ── */}
      <section style={{ padding:'64px 24px', background:'var(--bg-subtle, #F0F4FF)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <h2 style={{ fontFamily:'Sora,sans-serif', fontSize:'clamp(24px,4vw,42px)', fontWeight:800, color:'var(--text-primary)', margin:'0 0 12px' }}>Why MediMap Exists</h2>
            <p style={{ color:'var(--text-secondary)', fontSize:16, maxWidth:520, margin:'0 auto' }}>We're on a mission to fix healthcare affordability with technology</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:20 }}>
            {MISSION_CARDS.map((c, i) => (
              <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:24, padding:28, transition:'all 0.3s', cursor:'default' }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 16px 48px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
                <div style={{ width:52, height:52, borderRadius:16, background:`linear-gradient(135deg, ${c.color.replace('from-','').split(' ')[0].replace('emerald-500','#10b981').replace('blue-500','#3b82f6').replace('purple-500','#8b5cf6').replace('orange-500','#f97316')}, ${c.color.replace('to-','').split(' ').pop().replace('teal-500','#14b8a6').replace('cyan-500','#06b6d4').replace('pink-500','#ec4899').replace('amber-500','#f59e0b')})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:16 }}>
                  {c.icon}
                </div>
                <h3 style={{ fontFamily:'Sora,sans-serif', color:'var(--text-primary)', margin:'0 0 10px', fontWeight:700, fontSize:17 }}>{c.title}</h3>
                <p style={{ color:'var(--text-secondary)', fontSize:14, lineHeight:1.6, margin:0 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section style={{ padding:'64px 24px', background:'var(--bg-primary)' }}>
        <div style={{ maxWidth:700, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <h2 style={{ fontFamily:'Sora,sans-serif', fontSize:'clamp(24px,4vw,38px)', fontWeight:800, color:'var(--text-primary)', margin:0 }}>Our Journey</h2>
          </div>
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:2, background:'linear-gradient(to bottom, #10b981, #1B6EF3)', transform:'translateX(-50%)', opacity:0.3 }}/>
            {TIMELINE.map((t, i) => (
              <div key={i} style={{ display:'flex', gap:32, marginBottom:36, alignItems:'flex-start', flexDirection: i%2===0?'row':'row-reverse' }}>
                <div style={{ flex:1, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, padding:'20px 24px', boxShadow:'var(--shadow-sm)' }}>
                  <span style={{ fontSize:12, color:'#10b981', fontWeight:700, fontFamily:'Sora,sans-serif' }}>{t.year}</span>
                  <h3 style={{ fontFamily:'Sora,sans-serif', color:'var(--text-primary)', margin:'6px 0 8px', fontWeight:700 }}>{t.title}</h3>
                  <p style={{ color:'var(--text-secondary)', fontSize:14, margin:0, lineHeight:1.6 }}>{t.desc}</p>
                </div>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#1B6EF3)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, flexShrink:0, fontSize:14, boxShadow:'0 4px 12px rgba(16,185,129,0.3)', zIndex:1 }}>
                  {i+1}
                </div>
                <div style={{ flex:1 }}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section style={{ padding:'64px 24px', background:'var(--bg-subtle, #F0F4FF)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <h2 style={{ fontFamily:'Sora,sans-serif', fontSize:'clamp(24px,4vw,38px)', fontWeight:800, color:'var(--text-primary)', margin:'0 0 12px' }}>The Team Behind MediMap</h2>
            <p style={{ color:'var(--text-secondary)', fontSize:16 }}>Passionate about making healthcare affordable</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))', gap:20 }}>
            {TEAM.map((m, i) => (
              <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:24, padding:'28px 24px', textAlign:'center', transition:'all 0.3s' }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 16px 40px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
                <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#1B6EF3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 16px', boxShadow:'0 6px 20px rgba(16,185,129,0.3)' }}>{m.emoji}</div>
                <h3 style={{ fontFamily:'Sora,sans-serif', color:'var(--text-primary)', margin:'0 0 4px', fontWeight:700 }}>{m.name}</h3>
                <p style={{ color:'#10b981', fontSize:13, fontWeight:600, margin:'0 0 12px' }}>{m.role}</p>
                <p style={{ color:'var(--text-secondary)', fontSize:13, margin:0, lineHeight:1.6 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:'64px 24px' }}>
        <div style={{ maxWidth:700, margin:'0 auto', background:'linear-gradient(145deg, #060D1F, #0B1628)', borderRadius:28, padding:'56px 40px', textAlign:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'-20%', left:'-10%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.15),transparent)', filter:'blur(30px)' }}/>
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🚀</div>
            <h2 style={{ fontFamily:'Sora,sans-serif', color:'white', fontSize:32, fontWeight:800, margin:'0 0 14px' }}>Join the Movement</h2>
            <p style={{ color:'rgba(255,255,255,0.55)', fontSize:16, marginBottom:32, lineHeight:1.7 }}>Help us make healthcare transparent and affordable for every Indian family</p>
            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
              <Link to="/signup"><button style={{ padding:'14px 30px', borderRadius:999, border:'none', background:'linear-gradient(135deg,#10b981,#059669)', color:'white', fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:15, cursor:'pointer' }}>🔍 Start Saving Today</button></Link>
              <Link to="/pharmacy-dashboard"><button style={{ padding:'14px 30px', borderRadius:999, border:'1.5px solid rgba(255,255,255,0.25)', background:'rgba(255,255,255,0.08)', color:'white', fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:15, cursor:'pointer' }}>🏥 For Pharmacists</button></Link>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ padding:'32px 24px', borderTop:'1px solid var(--border)', textAlign:'center' }}>
        <p style={{ color:'var(--text-muted)', fontSize:13 }}>© 2026 MediMap · Making Healthcare Affordable for Every Indian 🇮🇳</p>
      </footer>

      <style>{`
        @keyframes floatA{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>
    </div>
  );
}
