// frontend/src/pages/LoginPage.jsx
// Premium UI — Customer + Pharmacist toggle with Convex Backend
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { lang } = useLang();
  
  const [userType, setUserType] = useState('customer'); // 'customer' | 'pharmacist'
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Customer form
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', password: '', confirm: '', age: '', gender: '' });
  // Pharmacist form
  const [pharmacistForm, setPharmacistForm] = useState({ name: '', ownerName: '', email: '', password: '', phone: '', address: '', gstin: '', licenseNo: '' });

  // Convex Mutations
  const customerLogin = useMutation(api.users.login);
  const customerRegister = useMutation(api.users.createUser);
  const pharmacistLogin = useMutation(api.pharmacistAuth.login);
  const pharmacistRegister = useMutation(api.pharmacistAuth.register);

  async function handleCustomerAuth(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (tab === 'login') {
        if (!customerForm.email || !customerForm.password) throw new Error('Please fill all fields.');
        const data = await customerLogin({ email: customerForm.email, password: customerForm.password });
        localStorage.setItem('medimap_user', JSON.stringify({ ...data.user, type: 'customer', token: data.token }));
      } else {
        if (!customerForm.name || !customerForm.email || !customerForm.password) throw new Error('Please fill all fields.');
        if (customerForm.password !== customerForm.confirm) throw new Error('Passwords do not match.');
        const data = await customerRegister({
          name: customerForm.name,
          email: customerForm.email,
          password: customerForm.password,
          role: 'customer',
          age: customerForm.age ? Number(customerForm.age) : undefined,
          gender: customerForm.gender || undefined
        });
        localStorage.setItem('medimap_user', JSON.stringify({ ...data.user, type: 'customer', token: data.token }));
      }
      navigate('/');
    } catch (err) { setError(err.message || 'An error occurred.'); }
    setLoading(false);
  }

  async function handlePharmacistAuth(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (tab === 'login') {
        if (!pharmacistForm.email || !pharmacistForm.password) throw new Error('Please fill all fields.');
        const data = await pharmacistLogin({ email: pharmacistForm.email, password: pharmacistForm.password });
        localStorage.setItem('pharmacist_token', data.token);
        localStorage.setItem('pharmacist_info', JSON.stringify(data.pharmacist));
      } else {
        if (!pharmacistForm.name || !pharmacistForm.email || !pharmacistForm.password || !pharmacistForm.phone || !pharmacistForm.address) throw new Error('Please fill all required fields.');
        const data = await pharmacistRegister({
          name: pharmacistForm.name,
          email: pharmacistForm.email,
          password: pharmacistForm.password,
          phone: pharmacistForm.phone,
          address: pharmacistForm.address,
          gstin: pharmacistForm.gstin,
          licenseNo: pharmacistForm.licenseNo
        });
        localStorage.setItem('pharmacist_token', data.token);
        localStorage.setItem('pharmacist_info', JSON.stringify(data.pharmacist));
      }
      navigate('/pharmacy-dashboard');
    } catch (err) { setError(err.message || 'An error occurred.'); }
    setLoading(false);
  }

  const handleSubmit = (e) => {
    if (userType === 'customer') handleCustomerAuth(e);
    else handlePharmacistAuth(e);
  };

  const inputClass = "w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-gray-400 font-medium";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden" style={{ backgroundColor: '#F8FAFD' }}>
      {/* Aurora Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse-glow" style={{ background: 'radial-gradient(circle, #1B6EF3, transparent)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-pulse-glow" style={{ background: 'radial-gradient(circle, #00C2A8, transparent)', animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up mt-8 mb-12">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 hover:scale-105 transition-transform">
            <img src="/logo.png" alt="MediMap" className="h-12 w-12 object-cover rounded-xl shadow-sm" />
            <span className="font-extrabold text-3xl font-sora text-gray-900 tracking-tight">Medi<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Map</span></span>
          </Link>
        </div>

        {/* Glass Card */}
        <div className="glass-panel bg-white/70 rounded-3xl p-8 shadow-2xl border border-white">
          
          {/* User Type Toggle */}
          <div className="flex p-1 bg-gray-100/80 rounded-2xl mb-8 border border-gray-200/50">
            {[
              { id: 'customer', label: 'Customer' },
              { id: 'pharmacist', label: 'Pharmacist' },
            ].map(t => (
              <button key={t.id} type="button" onClick={() => { setUserType(t.id); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${userType === t.id ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 font-sora mb-2">
              {tab === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-gray-500 font-medium text-sm">
              {userType === 'customer' ? 'Find medicines and save money.' : 'Grow your pharmacy business with us.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
              <span className="text-red-500">⚠️</span>
              <p className="text-sm font-semibold text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {tab === 'register' && (
              <input type="text" placeholder={userType === 'customer' ? "Full Name" : "Pharmacy Name"} required
                className={inputClass}
                value={userType === 'customer' ? customerForm.name : pharmacistForm.name}
                onChange={e => userType === 'customer' ? setCustomerForm({ ...customerForm, name: e.target.value }) : setPharmacistForm({ ...pharmacistForm, name: e.target.value })}
              />
            )}

            {tab === 'register' && userType === 'customer' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 pl-1">
                    {lang === 'hi' ? 'आयु' : 'Age'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </span>
                    <input
                      type="number" min="1" max="120"
                      placeholder={lang === 'hi' ? 'उम्र' : 'e.g. 25'}
                      className={inputClass + ' pl-9'}
                      value={customerForm.age}
                      onChange={e => setCustomerForm({ ...customerForm, age: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 pl-1">
                    {lang === 'hi' ? 'लिंग' : 'Gender'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                      </svg>
                    </span>
                    <select
                      className={inputClass + ' pl-9 appearance-none'}
                      value={customerForm.gender}
                      onChange={e => setCustomerForm({ ...customerForm, gender: e.target.value })}
                    >
                      <option value="">{lang === 'hi' ? 'चुनें' : 'Select'}</option>
                      <option value="Male">{lang === 'hi' ? 'पुरुष' : 'Male'}</option>
                      <option value="Female">{lang === 'hi' ? 'महिला' : 'Female'}</option>
                      <option value="Other">{lang === 'hi' ? 'अन्य' : 'Other'}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <input type="email" placeholder="Email Address" required
              className={inputClass}
              value={userType === 'customer' ? customerForm.email : pharmacistForm.email}
              onChange={e => userType === 'customer' ? setCustomerForm({ ...customerForm, email: e.target.value }) : setPharmacistForm({ ...pharmacistForm, email: e.target.value })}
            />

            {tab === 'register' && userType === 'pharmacist' && (
              <>
                <input type="text" placeholder="Phone Number" required className={inputClass}
                  value={pharmacistForm.phone} onChange={e => setPharmacistForm({ ...pharmacistForm, phone: e.target.value })} />
                <input type="text" placeholder="Pharmacy Address" required className={inputClass}
                  value={pharmacistForm.address} onChange={e => setPharmacistForm({ ...pharmacistForm, address: e.target.value })} />
              </>
            )}

            <div className="relative">
              <input type={showPass ? 'text' : 'password'} placeholder="Password" required
                className={inputClass}
                value={userType === 'customer' ? customerForm.password : pharmacistForm.password}
                onChange={e => userType === 'customer' ? setCustomerForm({ ...customerForm, password: e.target.value }) : setPharmacistForm({ ...pharmacistForm, password: e.target.value })}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-medium text-sm">
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>

            {tab === 'register' && userType === 'customer' && (
              <input type="password" placeholder="Confirm Password" required
                className={inputClass}
                value={customerForm.confirm} onChange={e => setCustomerForm({ ...customerForm, confirm: e.target.value })}
              />
            )}

            <button type="submit" disabled={loading}
              className="w-full mt-6 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 transform transition-transform hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-blue-600 to-teal-500">
              {loading ? 'Please wait...' : (tab === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-gray-500 text-sm font-medium">
              {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-blue-600 font-bold hover:underline">
                {tab === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
