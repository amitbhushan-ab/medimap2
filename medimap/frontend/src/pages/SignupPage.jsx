// src/pages/SignupPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function SignupPage() {
  const navigate = useNavigate();
  const { lang } = useLang();
  
  const [userType, setUserType] = useState('customer'); // 'customer' | 'pharmacist'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1);

  // Customer form
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', password: '', confirm: '', age: '', gender: '' });
  // Pharmacist form
  const [pharmacistForm, setPharmacistForm] = useState({ name: '', ownerName: '', email: '', password: '', phone: '', address: '', gstin: '', licenseNo: '' });

  const customerRegister = useMutation(api.users.createUser);
  const pharmacistRegister = useMutation(api.pharmacistAuth.register);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (userType === 'customer') {
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
      setStep(2);
    } catch (err) { setError(err.message || 'An error occurred.'); }
    setLoading(false);
  };

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#F8FAFD' }}>
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse-glow" style={{ background: 'radial-gradient(circle, #00C2A8, transparent)' }} />
        </div>
        <div className="relative z-10 glass-panel bg-white/70 rounded-3xl p-10 shadow-2xl border border-white text-center max-w-sm w-full animate-slide-up">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(0,194,168,0.3)]">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 font-sora">
            {lang === 'hi' ? 'स्वागत है! 🎉' : 'Welcome! 🎉'}
          </h2>
          <p className="text-gray-500 font-medium mb-8">
            {lang === 'hi' ? 'आपका अकाउंट सफलतापूर्वक बन गया है।' : 'Your account has been created successfully.'}
          </p>
          <button onClick={() => navigate(userType === 'pharmacist' ? '/pharmacy-dashboard' : '/')} className="w-full py-4 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-blue-600 to-teal-500 hover:scale-105 transition-transform">
            {lang === 'hi' ? 'डैशबोर्ड पर जाएं 🚀' : 'Go to Dashboard 🚀'}
          </button>
        </div>
      </div>
    );
  }

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

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 font-sora mb-2">Create an Account</h2>
            <p className="text-gray-500 font-medium text-sm">
              {userType === 'customer' ? 'Join us to start saving on medicines' : 'Partner with us to grow your pharmacy'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
              <span className="text-red-500">⚠️</span>
              <p className="text-sm font-semibold text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            
            <input type="text" placeholder={userType === 'customer' ? "Full Name" : "Pharmacy Name"} required
              className={inputClass}
              value={userType === 'customer' ? customerForm.name : pharmacistForm.name}
              onChange={e => userType === 'customer' ? setCustomerForm({ ...customerForm, name: e.target.value }) : setPharmacistForm({ ...pharmacistForm, name: e.target.value })}
            />

            {userType === 'customer' && (
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Age" className={inputClass}
                  value={customerForm.age} onChange={e => setCustomerForm({ ...customerForm, age: e.target.value })} />
                <select className={inputClass}
                  value={customerForm.gender} onChange={e => setCustomerForm({ ...customerForm, gender: e.target.value })}>
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            <input type="email" placeholder="Email Address" required
              className={inputClass}
              value={userType === 'customer' ? customerForm.email : pharmacistForm.email}
              onChange={e => userType === 'customer' ? setCustomerForm({ ...customerForm, email: e.target.value }) : setPharmacistForm({ ...pharmacistForm, email: e.target.value })}
            />

            {userType === 'pharmacist' && (
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

            {userType === 'customer' && (
              <input type="password" placeholder="Confirm Password" required
                className={inputClass}
                value={customerForm.confirm} onChange={e => setCustomerForm({ ...customerForm, confirm: e.target.value })}
              />
            )}

            <button type="submit" disabled={loading}
              className="w-full mt-6 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 transform transition-transform hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-blue-600 to-teal-500">
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-gray-500 text-sm font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-bold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
