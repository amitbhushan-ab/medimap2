// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

const CITIES = ['Delhi', 'Mumbai', 'Faridabad', 'Noida', 'Gurgaon', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: 'Faridabad', age: '', gender: '',
    conditions: [], allergies: '', notifications: true, language: 'en'
  });

  const CONDITIONS = ['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Thyroid', 'Arthritis'];

  // Mock search history
  const searchHistory = [
    { medicine: 'Paracetamol 500mg', date: '14 Mar 2026', price: '₹18', pharmacy: 'Apollo Sector 16' },
    { medicine: 'Metformin 500mg', date: '13 Mar 2026', price: '₹40', pharmacy: 'Jan Aushadhi Sector 21' },
    { medicine: 'Cetirizine 10mg', date: '12 Mar 2026', price: '₹28', pharmacy: 'Jan Aushadhi Sector 21' },
    { medicine: 'Azithromycin 500mg', date: '10 Mar 2026', price: '₹165', pharmacy: 'Jan Aushadhi Sector 21' },
  ];

  // Mock saved pharmacies
  const savedPharmacies = [
    { name: 'Apollo Pharmacy - Sector 16', address: 'Sector 16, Faridabad', rating: 4.5, isOpen: true },
    { name: 'Jan Aushadhi Store - Sector 21', address: 'Sector 21C, Faridabad', rating: 4.2, isOpen: true },
  ];

  useEffect(() => {
    const stored = localStorage.getItem('medimap_user');
    if (!stored) { navigate('/login'); return; }
    const u = JSON.parse(stored);
    setUser(u);
    // Load profile or defaults
    const profile = localStorage.getItem('medimap_profile');
    if (profile) {
      setForm({ ...form, ...JSON.parse(profile), name: u.name, email: u.email });
    } else {
      setForm(f => ({ ...f, name: u.name, email: u.email }));
    }
  }, []);

  const saveProfile = () => {
    localStorage.setItem('medimap_profile', JSON.stringify(form));
    localStorage.setItem('medimap_user', JSON.stringify({ ...user, name: form.name, email: form.email }));
    setUser(u => ({ ...u, name: form.name }));
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const logout = () => {
    localStorage.removeItem('medimap_user');
    navigate('/');
  };

  const toggleCondition = (c) => {
    setForm(f => ({
      ...f,
      conditions: f.conditions.includes(c)
        ? f.conditions.filter(x => x !== c)
        : [...f.conditions, c]
    }));
  };

  if (!user) return null;

  const initials = form.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const totalSavings = searchHistory.reduce((sum, s) => sum + parseInt(s.price.replace('₹', '')), 0);

  const t = (en, hi) => lang === 'hi' ? hi : en;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Saved toast */}
      {saved && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
          ✓ {t('Profile saved!', 'प्रोफ़ाइल सेव हो गई!')}
        </div>
      )}

      {/* Profile header */}
      <div className="card p-6 mb-6 bg-gradient-to-r from-[#2E7DFF] to-[#00C2A8] text-white">
        <div className="flex items-center gap-5 flex-wrap">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold border-2 border-white/30 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{form.name}</h1>
            <p className="text-white/80 text-sm mt-0.5">{form.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.city && <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">📍 {form.city}</span>}
              {form.phone && <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">📱 {form.phone}</span>}
              {form.conditions.length > 0 && (
                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                  💊 {form.conditions.length} {t('conditions', 'बीमारियां')}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-2"
          >
            ✏️ {t('Edit Profile', 'प्रोफ़ाइल बदलें')}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/20">
          <div className="text-center">
            <p className="text-2xl font-bold">{searchHistory.length}</p>
            <p className="text-white/70 text-xs mt-0.5">{t('Searches', 'खोजें')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">₹{totalSavings}</p>
            <p className="text-white/70 text-xs mt-0.5">{t('Total Saved', 'कुल बचत')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{savedPharmacies.length}</p>
            <p className="text-white/70 text-xs mt-0.5">{t('Saved Pharmacies', 'सेव फार्मेसी')}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {[
          { id: 'profile', label: t('Profile', 'प्रोफ़ाइल'), icon: '👤' },
          { id: 'history', label: t('Search History', 'खोज इतिहास'), icon: '🕐' },
          { id: 'saved', label: t('Saved', 'सेव किया'), icon: '❤️' },
          { id: 'settings', label: t('Settings', 'सेटिंग'), icon: '⚙️' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-white shadow text-[#2E7DFF]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="hidden sm:inline">{tab.icon}</span>
            <span className="text-xs sm:text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Profile Tab ── */}
      {activeTab === 'profile' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900 text-lg">{t('Personal Information', 'व्यक्तिगत जानकारी')}</h2>
            {editing && (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="btn-secondary text-sm !py-2">
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button onClick={saveProfile} className="btn-primary text-sm !py-2">
                  {t('Save', 'सेव करें')}
                </button>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('Full Name', 'पूरा नाम')}</label>
              {editing ? (
                <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              ) : (
                <p className="text-gray-900 font-medium py-2">{form.name || '—'}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('Email', 'ईमेल')}</label>
              {editing ? (
                <input className="input-field" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              ) : (
                <p className="text-gray-900 font-medium py-2">{form.email || '—'}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('Phone', 'फोन')}</label>
              {editing ? (
                <input className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              ) : (
                <p className="text-gray-900 font-medium py-2">{form.phone || '—'}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('City', 'शहर')}</label>
              {editing ? (
                <select className="input-field" value={form.city} onChange={e => setForm({...form, city: e.target.value})}>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              ) : (
                <p className="text-gray-900 font-medium py-2">{form.city || '—'}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('Age', 'उम्र')}</label>
              {editing ? (
                <input className="input-field" type="number" placeholder="25" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
              ) : (
                <p className="text-gray-900 font-medium py-2">{form.age || '—'}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('Gender', 'लिंग')}</label>
              {editing ? (
                <select className="input-field" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                  <option value="">{t('Select', 'चुनें')}</option>
                  <option value="male">{t('Male', 'पुरुष')}</option>
                  <option value="female">{t('Female', 'महिला')}</option>
                  <option value="other">{t('Other', 'अन्य')}</option>
                </select>
              ) : (
                <p className="text-gray-900 font-medium py-2 capitalize">{form.gender || '—'}</p>
              )}
            </div>
          </div>

          {/* Health conditions */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <label className="block text-xs font-medium text-gray-500 mb-3">{t('Health Conditions', 'स्वास्थ्य स्थितियां')}</label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map(c => (
                <button
                  key={c}
                  onClick={() => editing && toggleCondition(c)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                    form.conditions.includes(c)
                      ? 'bg-blue-50 border-[#2E7DFF] text-[#2E7DFF] font-medium'
                      : 'border-gray-200 text-gray-500'
                  } ${editing ? 'cursor-pointer hover:border-[#2E7DFF]' : 'cursor-default'}`}
                >
                  {c}
                </button>
              ))}
            </div>
            {!editing && form.conditions.length === 0 && (
              <p className="text-sm text-gray-400">{t('No conditions added. Click Edit Profile to add.', 'कोई बीमारी नहीं जोड़ी। Edit Profile पर क्लिक करें।')}</p>
            )}
          </div>

          {/* Allergies */}
          <div className="mt-5">
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('Known Allergies', 'एलर्जी')}</label>
            {editing ? (
              <input className="input-field" placeholder={t('e.g. Penicillin, Sulfa drugs', 'जैसे पेनिसिलिन, सल्फा')} value={form.allergies} onChange={e => setForm({...form, allergies: e.target.value})} />
            ) : (
              <p className="text-gray-900 font-medium py-2">{form.allergies || '—'}</p>
            )}
          </div>
        </div>
      )}

      {/* ── History Tab ── */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-gray-900">{t('Recent Searches', 'हाल की खोजें')}</h2>
            <span className="text-xs text-gray-400">{searchHistory.length} {t('searches', 'खोजें')}</span>
          </div>
          {searchHistory.map((item, i) => (
            <div key={i} className="card p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg flex-shrink-0">💊</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.medicine}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.pharmacy} · {item.date}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-[#00C2A8]">{item.price}</p>
                <Link
                  to={`/results?q=${encodeURIComponent(item.medicine)}`}
                  className="text-xs text-[#2E7DFF] hover:underline"
                >
                  {t('Search again', 'फिर खोजें')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Saved Tab ── */}
      {activeTab === 'saved' && (
        <div className="space-y-3">
          <h2 className="font-bold text-gray-900 mb-2">{t('Saved Pharmacies', 'सेव की गई फार्मेसियां')}</h2>
          {savedPharmacies.map((p, i) => (
            <div key={i} className="card p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-lg flex-shrink-0">🏥</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.address} · ⭐ {p.rating}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {p.isOpen ? t('Open', 'खुला') : t('Closed', 'बंद')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Settings Tab ── */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-900 mb-2">{t('Settings', 'सेटिंग')}</h2>

          {/* Notifications */}
          <div className="card p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 text-sm">{t('Price Alerts', 'कीमत अलर्ट')}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t('Get notified when prices drop', 'कीमत कम होने पर सूचना पाएं')}</p>
            </div>
            <button
              onClick={() => setForm(f => ({...f, notifications: !f.notifications}))}
              className={`w-12 h-6 rounded-full transition-all relative ${form.notifications ? 'bg-[#2E7DFF]' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.notifications ? 'left-6' : 'left-0.5'}`}></span>
            </button>
          </div>

          {/* Change password */}
          <div className="card p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 text-sm">{t('Change Password', 'पासवर्ड बदलें')}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t('Update your account password', 'अपना पासवर्ड अपडेट करें')}</p>
            </div>
            <Link to="/login" className="btn-secondary text-xs !py-1.5 !px-3">
              {t('Change', 'बदलें')}
            </Link>
          </div>

          {/* Delete account */}
          <div className="card p-5 flex items-center justify-between border-red-100">
            <div>
              <p className="font-medium text-red-600 text-sm">{t('Delete Account', 'अकाउंट डिलीट करें')}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t('Permanently remove your account', 'अकाउंट हमेशा के लिए हटाएं')}</p>
            </div>
            <button className="text-xs text-red-500 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all">
              {t('Delete', 'डिलीट')}
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full py-3 rounded-xl border-2 border-red-200 text-red-500 font-semibold text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2"
          >
            🚪 {t('Logout', 'लॉगआउट')}
          </button>
        </div>
      )}
    </div>
  );
}
