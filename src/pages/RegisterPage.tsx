
import React, { useState } from 'react';
import { clinicStore } from '../store';
import { UserPlus, ChevronLeft } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await clinicStore.registerUser(formData);
    navigate('/login');
  };

  return (
    <div className="gradient-bg flex items-center justify-center min-h-screen p-4">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-[550px] border border-white/20 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-50 rounded-3xl text-teal-600 mb-6 shadow-sm border border-teal-100">
            <UserPlus size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 mb-2">Create Account</h1>
          <p className="text-slate-500 text-lg font-medium">Join Q-Triage for faster clinical care</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Username</label>
              <input
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                placeholder="johndoe123"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Full Name</label>
              <input
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-400 font-medium"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-400 font-medium"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 hover:opacity-95 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-teal-100 text-xl mt-4 active:scale-[0.98]"
          >
            Sign Up Now
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Already have an account?</p>
          <button
            onClick={() => navigate('/login')}
            className="group inline-flex items-center gap-2 text-teal-600 font-black text-lg hover:text-teal-700 transition-colors"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
