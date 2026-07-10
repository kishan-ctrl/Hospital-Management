import React, { useState } from 'react';
import { X, User, Mail, Lock, Calendar, Phone, MapPin, Activity, ShieldAlert, HeartPulse } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Login State
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register State
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    dateOfBirth: '',
    gender: 'Male',
    phoneNumber: '',
    address: '',
    bloodGroup: 'O+',
    allergies: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: ''
  });

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Login failed. Please check your credentials.');
      }

      // Success
      localStorage.setItem('token', resData.accessToken);
      localStorage.setItem('refreshToken', resData.refreshToken);
      onAuthSuccess(resData.data.user);
      onClose();
      // Reset state
      setLoginData({ email: '', password: '' });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Format registration payload for the backend validator schema
    const allergiesArray = registerData.allergies 
      ? registerData.allergies.split(',').map(item => item.trim()).filter(Boolean)
      : [];

    const payload = {
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
      dateOfBirth: new Date(registerData.dateOfBirth).toISOString(),
      gender: registerData.gender,
      phoneNumber: registerData.phoneNumber,
      address: registerData.address,
      bloodGroup: registerData.bloodGroup,
      allergies: allergiesArray,
      emergencyContact: {
        name: registerData.emergencyContactName,
        relationship: registerData.emergencyContactRelationship,
        phone: registerData.emergencyContactPhone
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Registration failed. Please review details.');
      }

      // Success -> Save and Log In
      localStorage.setItem('token', resData.accessToken);
      localStorage.setItem('refreshToken', resData.refreshToken);
      onAuthSuccess(resData.data.user);
      onClose();
      // Reset state
      setRegisterData({
        name: '',
        email: '',
        password: '',
        dateOfBirth: '',
        gender: 'Male',
        phoneNumber: '',
        address: '',
        bloodGroup: 'O+',
        allergies: '',
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactPhone: ''
      });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 backdrop-blur-md p-4 overflow-y-auto transition-opacity duration-300">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl z-10 text-left my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 shadow-sm mb-6">
          <HeartPulse className="h-7 w-7" />
        </div>

        <h2 className="text-2xl font-extrabold text-blue-950 tracking-tight text-center">
          {isLogin ? 'Login to MediWell' : 'Create Patient Account'}
        </h2>
        <p className="mt-1 text-slate-500 font-semibold text-xs text-center leading-relaxed">
          {isLogin 
            ? 'Access your appointment scheduling and medical imaging scan files.' 
            : 'Register a clinical demographics profile to book appointments and view records.'}
        </p>

        {/* Error Alert Display */}
        {errorMsg && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold flex items-start gap-2.5 animate-pulse">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {isLogin ? (
          /* ================= LOGIN FORM ================= */
          <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input 
                  type="email" 
                  required 
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  placeholder="name@example.com" 
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input 
                  type="password" 
                  required 
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  placeholder="••••••••" 
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="shine-hover mt-4 w-full rounded-xl bg-blue-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition disabled:bg-slate-400 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Login Now'}
            </button>

            <div className="mt-6 text-center text-xs font-semibold text-slate-500">
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={() => { setIsLogin(false); setErrorMsg(''); }}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                Register as Patient
              </button>
            </div>
          </form>
        ) : (
          /* ================= REGISTER FORM ================= */
          <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
            
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-900">1. Account Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    required 
                    value={registerData.name}
                    onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                    placeholder="John Doe" 
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input 
                    type="email" 
                    required 
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    placeholder="john@example.com" 
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input 
                  type="password" 
                  required 
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  placeholder="Min 6 characters" 
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors"
                />
              </div>
            </div>

            <div className="border-b border-slate-100 pt-2 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-900">2. Personal Demographics</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input 
                    type="date" 
                    required 
                    value={registerData.dateOfBirth}
                    onChange={(e) => setRegisterData({...registerData, dateOfBirth: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Gender</label>
                <select 
                  value={registerData.gender}
                  onChange={(e) => setRegisterData({...registerData, gender: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input 
                    type="tel" 
                    required 
                    value={registerData.phoneNumber}
                    onChange={(e) => setRegisterData({...registerData, phoneNumber: e.target.value})}
                    placeholder="+1 (555) 000-0000" 
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Blood Group</label>
                <select 
                  value={registerData.bloodGroup}
                  onChange={(e) => setRegisterData({...registerData, bloodGroup: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors"
                >
                  <option>O+</option>
                  <option>O-</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Residential Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  required 
                  value={registerData.address}
                  onChange={(e) => setRegisterData({...registerData, address: e.target.value})}
                  placeholder="123 Health Ave, St. Louis" 
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Known Allergies (Comma separated)</label>
              <div className="relative">
                <Activity className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  value={registerData.allergies}
                  onChange={(e) => setRegisterData({...registerData, allergies: e.target.value})}
                  placeholder="e.g. Peanuts, Penicillin, Pollen" 
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors"
                />
              </div>
            </div>

            <div className="border-b border-slate-100 pt-2 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-900">3. Emergency Contact</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Contact Name</label>
                <input 
                  type="text" 
                  required 
                  value={registerData.emergencyContactName}
                  onChange={(e) => setRegisterData({...registerData, emergencyContactName: e.target.value})}
                  placeholder="Jane Doe" 
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Relationship</label>
                <input 
                  type="text" 
                  required 
                  value={registerData.emergencyContactRelationship}
                  onChange={(e) => setRegisterData({...registerData, emergencyContactRelationship: e.target.value})}
                  placeholder="Spouse, Parent" 
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Contact Phone</label>
              <input 
                type="tel" 
                required 
                value={registerData.emergencyContactPhone}
                onChange={(e) => setRegisterData({...registerData, emergencyContactPhone: e.target.value})}
                placeholder="+1 (555) 000-0000" 
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="shine-hover mt-6 w-full rounded-xl bg-teal-500 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-teal-500/20 hover:bg-teal-600 hover:-translate-y-0.5 active:translate-y-0 transition disabled:bg-slate-400 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Submitting Details...' : 'Create Account & Log In'}
            </button>

            <div className="mt-6 text-center text-xs font-semibold text-slate-500">
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => { setIsLogin(true); setErrorMsg(''); }}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                Login
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
