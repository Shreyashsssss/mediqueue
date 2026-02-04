
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { clinicStore } from '../store';
import { STAFF_CREDENTIALS, DOCTOR_CREDENTIALS } from '../constants';
import { ShieldCheck, User as UserIcon, BriefcaseMedical, ArrowRight } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);
  const [error, setError] = useState('');

  const handleRoleSwitch = (newRole: UserRole) => {
    setRole(newRole);
    setError('');
    if (newRole === UserRole.STAFF) {
      setEmail(STAFF_CREDENTIALS.email);
      setPassword(STAFF_CREDENTIALS.password);
    } else if (newRole === UserRole.DOCTOR) {
      setEmail(DOCTOR_CREDENTIALS.email);
      setPassword(DOCTOR_CREDENTIALS.password);
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === UserRole.STAFF) {
      if (email === STAFF_CREDENTIALS.email && password === STAFF_CREDENTIALS.password) {
        clinicStore.setSessionUser({ id: 'staff-1', username: 'staff', name: 'Clinical Staff', email, role: UserRole.STAFF });
        navigate('/dashboard');
        return;
      }
      setError('Invalid staff credentials.');
      return;
    }

    if (role === UserRole.DOCTOR) {
      if (email === DOCTOR_CREDENTIALS.email && password === DOCTOR_CREDENTIALS.password) {
        clinicStore.setSessionUser({ id: 'doc-admin-1', username: 'doctor', name: 'Head Doctor', email, role: UserRole.DOCTOR });
        navigate('/dashboard');
        return;
      }
      setError('Invalid doctor credentials.');
      return;
    }

    const user = await clinicStore.login(email, password);
    if (user && user.role === UserRole.PATIENT) {
      navigate('/dashboard');
    } else {
      setError('Invalid patient credentials. Ensure you have registered first.');
    }
  };

  return (
    <div className="gradient-bg flex items-center justify-center min-h-screen p-4">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-[500px] border border-white/20 relative overflow-hidden">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-50 rounded-3xl text-teal-600 mb-6 shadow-sm border border-teal-100">
            {role === UserRole.PATIENT ? <UserIcon size={40} /> : role === UserRole.STAFF ? <BriefcaseMedical size={40} /> : <ShieldCheck size={40} />}
          </div>
          <h1 className="text-4xl font-black text-slate-800 mb-2">Welcome Back</h1>
          <p className="text-slate-500 text-lg font-medium">Sign in to access your {role.toLowerCase()} account</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
          {[
            { id: UserRole.PATIENT, label: 'Patient' },
            { id: UserRole.STAFF, label: 'Staff' },
            { id: UserRole.DOCTOR, label: 'Doctor' }
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => handleRoleSwitch(r.id)}
              className={`flex-1 py-3 px-2 rounded-xl text-sm font-black transition-all ${role === r.id ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold text-center border border-red-100">{error}</div>}

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-400 font-medium"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-400 font-medium"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 hover:opacity-90 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-teal-100 text-xl mt-4 active:scale-95 flex items-center justify-center gap-3"
          >
            Sign In
            <ArrowRight size={22} strokeWidth={3} />
          </button>
        </form>

        {role === UserRole.PATIENT && (
          <div className="mt-8 text-center">
            <p className="text-slate-500 font-medium">Don't have an account?</p>
            <button
              onClick={() => navigate('/register')}
              className="text-teal-600 font-black hover:underline text-lg inline-flex items-center mt-1"
            >
              Register as Patient →
            </button>
          </div>
        )}

        {role !== UserRole.PATIENT && (
          <div className="mt-8 p-4 bg-teal-50 rounded-2xl border border-teal-100 text-center">
            <p className="text-xs font-black text-teal-700 uppercase tracking-widest mb-1">Demo Environment</p>
            <p className="text-[10px] text-teal-600 font-medium">Use pre-filled credentials for administrative access</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
