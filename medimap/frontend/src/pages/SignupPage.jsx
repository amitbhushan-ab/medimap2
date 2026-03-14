// src/pages/SignupPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1); // 1 = form, 2 = success

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password) {
      setError(lang === 'hi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें।' : 'Please fill in all required fields.');
      return;
    }
    if (form.password.length < 6) {
      setError(lang === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError(lang === 'hi' ? 'पासवर्ड मेल नहीं खाते।' : 'Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('medimap_user', JSON.stringify({ email: form.email, name: form.name }));
      setStep(2);
    }, 1500);
  };

  if (step === 2) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2E7DFF] to-[#00C2A8] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {lang === 'hi' ? `स्वागत है, ${form.name}! 🎉` : `Welcome, ${form.name}! 🎉`}
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            {lang === 'hi'
              ? 'आपका अकाउंट सफलतापूर्वक बन गया है।'
              : 'Your account has been created successfully.'}
          </p>
          <button onClick={() => navigate('/')} className="btn-primary w-full !py-3">
            {lang === 'hi' ? 'MediMap एक्सप्लोर करें 🚀' : 'Explore MediMap 🚀'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-teal-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40"></div>
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2E7DFF] to-[#00C2A8] flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white"/>
                <circle cx="12" cy="9" r="2.5" fill="rgba(255,255,255,0.4)"/>
              </svg>
            </div>
            <span className="font-bold text-2xl text-gray-900">Medi<span className="text-[#2E7DFF]">Map</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {lang === 'hi' ? 'अकाउंट बनाएं' : 'Create your account'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {lang === 'hi' ? 'MediMap से जुड़ें — बिल्कुल मुफ़्त' : 'Join MediMap — completely free'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Google */}
          <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all mb-6">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {lang === 'hi' ? 'Google से साइन अप करें' : 'Sign up with Google'}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100"></div>
            <span className="text-xs text-gray-400">{lang === 'hi' ? 'या ईमेल से' : 'or with email'}</span>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {lang === 'hi' ? 'पूरा नाम' : 'Full Name'} *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder={lang === 'hi' ? 'आपका नाम' : 'Your full name'}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {lang === 'hi' ? 'ईमेल' : 'Email'} *
            </label>
            <input
              type="email"
              className="input-field"
              placeholder={lang === 'hi' ? 'आपका ईमेल' : 'your@email.com'}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {lang === 'hi' ? 'मोबाइल नंबर' : 'Phone Number'}{' '}
              <span className="text-gray-400 font-normal">({lang === 'hi' ? 'वैकल्पिक' : 'optional'})</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">🇮🇳 +91</span>
              <input
                type="tel"
                className="input-field !pl-16"
                placeholder="98765 43210"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {lang === 'hi' ? 'पासवर्ड' : 'Password'} *
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {form.password && (
              <div className="mt-2 flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                    form.password.length >= i * 3
                      ? form.password.length >= 10 ? 'bg-emerald-500' : 'bg-yellow-400'
                      : 'bg-gray-200'
                  }`} />
                ))}
                <span className="text-xs text-gray-400 ml-1">
                  {form.password.length >= 10 ? (lang === 'hi' ? 'मजबूत' : 'Strong') :
                   form.password.length >= 6 ? (lang === 'hi' ? 'ठीक है' : 'OK') :
                   (lang === 'hi' ? 'कमज़ोर' : 'Weak')}
                </span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {lang === 'hi' ? 'पासवर्ड दोबारा डालें' : 'Confirm Password'} *
            </label>
            <input
              type="password"
              className={`input-field ${form.confirm && form.confirm !== form.password ? 'border-red-300' : form.confirm && form.confirm === form.password ? 'border-emerald-300' : ''}`}
              placeholder="••••••••"
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
            />
            {form.confirm && form.confirm !== form.password && (
              <p className="text-xs text-red-500 mt-1">
                {lang === 'hi' ? 'पासवर्ड मेल नहीं खाते' : 'Passwords do not match'}
              </p>
            )}
            {form.confirm && form.confirm === form.password && (
              <p className="text-xs text-emerald-600 mt-1">✓ {lang === 'hi' ? 'पासवर्ड मेल खाते हैं' : 'Passwords match'}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-4">
              {error}
            </div>
          )}

          {/* Signup button */}
          <button
            onClick={handleSignup}
            disabled={loading}
            className="btn-primary w-full !py-3 text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {lang === 'hi' ? 'अकाउंट बन रहा है...' : 'Creating account...'}
              </span>
            ) : (
              lang === 'hi' ? 'साइन अप करें' : 'Create Account'
            )}
          </button>

          {/* Terms */}
          <p className="text-center text-xs text-gray-400 mt-4">
            {lang === 'hi'
              ? 'साइन अप करके आप हमारी शर्तों से सहमत हैं।'
              : 'By signing up, you agree to our Terms & Privacy Policy.'}
          </p>

          {/* Login link */}
          <p className="text-center text-sm text-gray-500 mt-4">
            {lang === 'hi' ? 'पहले से अकाउंट है?' : 'Already have an account?'}{' '}
            <Link to="/login" className="text-[#2E7DFF] font-semibold hover:underline">
              {lang === 'hi' ? 'लॉगिन करें' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
