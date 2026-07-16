// frontend/src/pages/LoginPage.jsx
// Unified login — Customer + Pharmacist toggle
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const [userType, setUserType] = useState('customer'); // 'customer' | 'pharmacist'
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Customer form
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', password: '', confirm: '' });
  // Pharmacist form
  const [pharmacistForm, setPharmacistForm] = useState({ name: '', ownerName: '', email: '', password: '', phone: '', address: '', gstin: '', licenseNo: '' });

  async function handleCustomerAuth() {
    setLoading(true); setError('');
    try {
      if (tab === 'login') {
        if (!customerForm.email || !customerForm.password) throw new Error('Please fill all fields.');
      } else {
        if (!customerForm.name || !customerForm.email || !customerForm.password) throw new Error('Please fill all fields.');
        if (customerForm.password !== customerForm.confirm) throw new Error('Passwords do not match.');
      }

      const endpoint = tab === 'login' ? '/login' : '/register';
      const body = tab === 'login'
        ? { email: customerForm.email, password: customerForm.password }
        : { name: customerForm.name, email: customerForm.email, password: customerForm.password };

      const res = await fetch(`https://medimap-backend-ygqj.onrender.com/api/users${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      localStorage.setItem('medimap_user', JSON.stringify({ email: data.user.email, name: data.user.name, type: 'customer', token: data.token }));
      navigate('/');
    } catch (err) { setError(err.message); }
    setLoading(false);
  }

  async function handlePharmacistAuth() {
    setLoading(true); setError('');
    try {
      const endpoint = tab === 'login' ? '/login' : '/register';
      const body = tab === 'login'
        ? { email: pharmacistForm.email, password: pharmacistForm.password }
        : pharmacistForm;
      const res = await fetch(`https://medimap-backend-ygqj.onrender.com/api/pharmacist${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      localStorage.setItem('pharmacist_token', data.token);
      localStorage.setItem('pharmacist_info', JSON.stringify(data.pharmacist));
      navigate('/pharmacy-dashboard');
    } catch (err) { setError(err.message); }
    setLoading(false);
  }

  const handleSubmit = () => {
    setError('');
    if (userType === 'customer') handleCustomerAuth();
    else handlePharmacistAuth();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-40"></div>
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
            <img src="/logo.png" alt="MediMap" className="h-12 object-contain" />
            <span className="font-bold text-2xl text-gray-900">Medi<span className="text-[#2E7DFF]">Map</span></span>
          </Link>
        </div>

        {/* User Type Toggle */}
        <div className="flex gap-3 mb-5">
          {[
            { id: 'customer', icon: '👤', label: 'Customer', desc: 'Find medicines & compare prices' },
            { id: 'pharmacist', icon: '🏥', label: 'Pharmacist', desc: 'Manage your pharmacy' },
          ].map(t => (
            <button key={t.id} onClick={() => { setUserType(t.id); setError(''); }}
              className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all ${userType === t.id ? 'border-[#2E7DFF] bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
              <div className="text-2xl mb-1">{t.icon}</div>
              <p className={`font-bold text-sm ${userType === t.id ? 'text-[#2E7DFF]' : 'text-gray-700'}`}>{t.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>

        {/* Login/Register tabs */}
        <div className="card p-6">
          <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-xl">
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                {t === 'login' ? '🔑 Login' : '✏️ Register'}
              </button>
            ))}
          </div>

          {/* Google OAuth */}
          <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all mb-5">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100"></div>
            <span className="text-xs text-gray-400">or with email</span>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>

          {/* Customer Fields */}
          {userType === 'customer' && (
            <div className="space-y-3">
              {tab === 'register' && (
                <input className="input-field" placeholder="Full Name *"
                  value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} />
              )}
              <input className="input-field" type="email" placeholder="Email *"
                value={customerForm.email} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} />
              <div className="relative">
                <input className="input-field pr-10" type={showPass ? 'text' : 'password'} placeholder="Password *"
                  value={customerForm.password} onChange={e => setCustomerForm({...customerForm, password: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {tab === 'register' && (
                <input className="input-field" type="password" placeholder="Confirm Password *"
                  value={customerForm.confirm} onChange={e => setCustomerForm({...customerForm, confirm: e.target.value})} />
              )}
            </div>
          )}

          {/* Pharmacist Fields */}
          {userType === 'pharmacist' && (
            <div className="space-y-3">
              {tab === 'register' && (
                <>
                  <input className="input-field" placeholder="Pharmacy Name *"
                    value={pharmacistForm.name} onChange={e => setPharmacistForm({...pharmacistForm, name: e.target.value})} />
                  <input className="input-field" placeholder="Owner Name"
                    value={pharmacistForm.ownerName} onChange={e => setPharmacistForm({...pharmacistForm, ownerName: e.target.value})} />
                  <input className="input-field" placeholder="Phone"
                    value={pharmacistForm.phone} onChange={e => setPharmacistForm({...pharmacistForm, phone: e.target.value})} />
                  <input className="input-field" placeholder="Address"
                    value={pharmacistForm.address} onChange={e => setPharmacistForm({...pharmacistForm, address: e.target.value})} />
                  <input className="input-field" placeholder="GSTIN"
                    value={pharmacistForm.gstin} onChange={e => setPharmacistForm({...pharmacistForm, gstin: e.target.value})} />
                  <input className="input-field" placeholder="Drug License No"
                    value={pharmacistForm.licenseNo} onChange={e => setPharmacistForm({...pharmacistForm, licenseNo: e.target.value})} />
                </>
              )}
              <input className="input-field" type="email" placeholder="Email *"
                value={pharmacistForm.email} onChange={e => setPharmacistForm({...pharmacistForm, email: e.target.value})} />
              <div className="relative">
                <input className="input-field pr-10" type={showPass ? 'text' : 'password'} placeholder="Password *"
                  value={pharmacistForm.password} onChange={e => setPharmacistForm({...pharmacistForm, password: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {tab === 'login' && (
                <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-2 text-center">
                  Demo: <code>apollo@medimap.com</code> / <code>pharmacy123</code>
                </p>
              )}
            </div>
          )}

          {error && <div className="mt-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-2.5">{error}</div>}

          <button onClick={handleSubmit} disabled={loading}
            className="btn-primary w-full !py-3 text-base mt-4"
            style={{ background: userType === 'pharmacist' ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#2E7DFF,#1a6aef)' }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Please wait...
              </span>
            ) : (
              userType === 'pharmacist'
                ? (tab === 'login' ? '🏥 Login to Dashboard' : '✅ Register Pharmacy')
                : (tab === 'login' ? '🔑 Sign In' : '✅ Create Account')
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setTab(tab === 'login' ? 'register' : 'login')} className="text-[#2E7DFF] font-semibold hover:underline">
              {tab === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
