
import React, { useState, useEffect } from 'react';
import { User, Appointment, TriageLevel } from '../types';
import { clinicStore } from '../store';
import { analyzeTriage } from '../services/geminiService';
import { LayoutDashboard, LogOut, Users, AlertCircle, Zap, Clock, Plus, ClipboardList, UserPlus, BrainCircuit, Loader2, Activity, Info, ChevronRight, LogOut as LogOutIcon } from 'lucide-react';

interface StaffDashboardProps {
  user: User;
  onLogout: () => void;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ user, onLogout }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(clinicStore.getAppointments());
  const [isAddingOffline, setIsAddingOffline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', age: 30, gender: 'Male', phone: '', symptoms: '', urgency: 5, timeSlot: 'ASAP'
  });

  // Fetch data periodically
  useEffect(() => {
    const loadData = async () => {
      await clinicStore.refreshAppointments();
      setAppointments(clinicStore.getAppointments());
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddOffline = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const triage = await analyzeTriage(formData.symptoms);

    const triageLevel = triage?.isValid ? (triage.level as TriageLevel) : TriageLevel.NORMAL;
    const triageScore = triage?.isValid ? triage.score : (formData.urgency * 10);

    await clinicStore.addAppointment({
      patientId: 'offline-' + Math.random(),
      patientName: formData.name,
      age: formData.age,
      gender: formData.gender,
      phone: formData.phone,
      symptoms: formData.symptoms,
      urgencyScale: (triage?.isValid && triage.urgencyScale) ? triage.urgencyScale : formData.urgency,
      triageLevel: triageLevel,
      triageScore: triageScore,
      timeSlot: formData.timeSlot,
      doctorId: 'doc1',
      isOffline: true
    });
    setAppointments(clinicStore.getAppointments());
    setLoading(false);
    setIsAddingOffline(false);
    setFormData({ name: '', age: 30, gender: 'Male', phone: '', symptoms: '', urgency: 5, timeSlot: 'ASAP' });
  };

  const handleCheckOut = async (id: string) => {
    await clinicStore.removeAppointment(id);
    setAppointments(clinicStore.getAppointments());
  };

  const sortedApps = clinicStore.getSortedAppointments();

  // Metric calculation for all 4 categories
  const counts = {
    [TriageLevel.EMERGENCY]: appointments.filter(a => a.triageLevel === TriageLevel.EMERGENCY).length,
    [TriageLevel.CRITICAL]: appointments.filter(a => a.triageLevel === TriageLevel.CRITICAL).length,
    [TriageLevel.INTERMEDIATE]: appointments.filter(a => a.triageLevel === TriageLevel.INTERMEDIATE).length,
    [TriageLevel.NORMAL]: appointments.filter(a => a.triageLevel === TriageLevel.NORMAL).length,
  };

  return (
    <div className="min-h-screen bg-[#f0fafa]">
      <nav className="bg-white border-b border-teal-50 px-8 py-5 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-100">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Staff Dashboard</h1>
            <p className="text-xs text-teal-600 font-black uppercase tracking-widest">Queue Management Portal</p>
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all border border-slate-200">
          <LogOutIcon size={18} />
          Logout
        </button>
      </nav>

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Metric Cards - 4 Priority Levels + Total */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          <div className="bg-white p-6 rounded-3xl border-l-4 border-slate-900 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Emergency</p>
              <p className="text-3xl font-black text-red-600">{counts[TriageLevel.EMERGENCY]}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-xl text-red-600">
              <Activity size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border-l-4 border-red-500 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Critical</p>
              <p className="text-3xl font-black text-red-500">{counts[TriageLevel.CRITICAL]}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-xl text-red-500">
              <AlertCircle size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border-l-4 border-orange-500 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Intermediate</p>
              <p className="text-3xl font-black text-orange-500">{counts[TriageLevel.INTERMEDIATE]}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-xl text-orange-500">
              <Zap size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border-l-4 border-teal-500 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Normal</p>
              <p className="text-3xl font-black text-teal-600">{counts[TriageLevel.NORMAL]}</p>
            </div>
            <div className="bg-teal-50 p-3 rounded-xl text-teal-600">
              <Info size={24} />
            </div>
          </div>
          <div className="bg-teal-700 p-6 rounded-3xl text-white shadow-lg flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-teal-100 text-[10px] font-black uppercase tracking-wider">Total Queue</p>
              <p className="text-3xl font-black">{appointments.length}</p>
            </div>
            <Users size={32} className="opacity-40" />
          </div>
        </div>

        {/* Register Walk-in Action */}
        <div className="bg-white p-6 rounded-[32px] shadow-md border border-teal-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-teal-50 p-3 rounded-2xl text-teal-600 border border-teal-100">
              <UserPlus size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">Walk-in Patient</h2>
              <p className="text-slate-400 text-xs font-medium">Automatic clinical priority assignment</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddingOffline(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg active:scale-95 text-sm"
          >
            <Plus size={20} strokeWidth={3} />
            Add to Queue
          </button>
        </div>

        {/* Patient Queue List */}
        <div className="bg-white rounded-[40px] shadow-2xl border border-teal-50 overflow-hidden">
          <div className="p-8 border-b border-teal-50 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="bg-teal-50 p-3 rounded-2xl text-teal-600 border border-teal-100">
                <ClipboardList size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800">Live Triage Queue</h2>
                <p className="text-slate-400 font-medium text-xs">Priority Ranking: Emergency ; Critical ; Intermediate ; Normal</p>
              </div>
            </div>
            <div className="bg-slate-50 px-4 py-2 rounded-full border border-slate-100 flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Est. Wait Time Calculation Active</span>
            </div>
          </div>

          <div className="p-6">
            {sortedApps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-teal-50 p-10 rounded-full text-teal-100 mb-6">
                  <ClipboardList size={80} strokeWidth={1} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Queue Empty</h3>
                <p className="text-slate-400 font-medium">All patients have been processed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedApps.map((app, idx) => {
                  const estWait = idx * 12; // 12 mins per patient in front, updates automatically on removal
                  return (
                    <div key={app.id} className={`p-6 bg-white border rounded-[28px] hover:shadow-xl transition-all flex items-center gap-6 group relative overflow-hidden ${app.triageLevel === TriageLevel.EMERGENCY ? 'border-red-200 bg-red-50/10 ring-2 ring-red-500/5' : 'border-slate-100'
                      }`}>
                      {app.triageLevel === TriageLevel.EMERGENCY && (
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600 animate-pulse"></div>
                      )}

                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all bg-slate-100 text-slate-400 group-hover:bg-teal-600 group-hover:text-white">
                        {idx + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-black text-slate-800">{app.patientName}</h4>
                          {app.isOffline && (
                            <span className="text-[8px] font-black bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full uppercase">Walk-in</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{app.age}y • {app.gender} • Ref: {app.id}</p>
                      </div>

                      <div className="flex-1 px-6 border-x border-slate-50 hidden lg:block">
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Diagnosis Context</p>
                        <p className="text-slate-600 text-xs font-bold italic line-clamp-1">"{app.symptoms}"</p>
                      </div>

                      <div className="w-32 flex flex-col items-center justify-center gap-1 border-r border-slate-50">
                        <p className="text-[9px] text-slate-400 font-black uppercase">Est. Wait</p>
                        <div className={`flex items-center gap-1.5 font-black text-sm ${estWait === 0 ? 'text-emerald-500' : 'text-slate-800'}`}>
                          <Clock size={14} />
                          {estWait === 0 ? 'Next Up' : `${estWait}m`}
                        </div>
                      </div>

                      <div className="w-40 text-center">
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border-2 flex items-center justify-center gap-2 ${app.triageLevel === TriageLevel.EMERGENCY ? 'bg-slate-900 text-red-500 border-red-500' :
                          app.triageLevel === TriageLevel.CRITICAL ? 'bg-red-50 text-red-600 border-red-100' :
                            app.triageLevel === TriageLevel.INTERMEDIATE ? 'bg-orange-50 text-orange-600 border-orange-100' :
                              'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                          {app.triageLevel === TriageLevel.EMERGENCY && <Activity size={12} className="animate-pulse" />}
                          {app.triageLevel}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all border border-slate-100">
                          <Info size={18} />
                        </button>
                        <button
                          onClick={() => handleCheckOut(app.id)}
                          className="px-6 py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-95 flex items-center gap-2"
                        >
                          Check Out <LogOut size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Offline Entry Modal */}
      {isAddingOffline && (
        <div className="fixed inset-0 bg-teal-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <button onClick={() => setIsAddingOffline(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all">
                <Plus size={24} className="rotate-45" strokeWidth={3} />
              </button>
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2 leading-tight">Walk-in Patient</h2>
            <p className="text-slate-400 font-medium mb-8">Register patient for automatic AI prioritization</p>

            <form onSubmit={handleAddOffline} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input required placeholder="Patient Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 transition-all font-bold" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                  <input type="number" placeholder="Years" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 transition-all font-bold" value={formData.age} onChange={e => setFormData({ ...formData, age: +e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 transition-all font-bold" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                  <input placeholder="+1 (555) 000-0000" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 transition-all font-bold" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Observation / Symptoms</label>
                <textarea required placeholder="Detailed observation for AI triage analysis..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-32 outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none shadow-inner font-medium" value={formData.symptoms} onChange={e => setFormData({ ...formData, symptoms: e.target.value })} />
              </div>

              <div className="p-5 bg-teal-50 rounded-2xl border border-teal-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shrink-0">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <p className="text-teal-900 font-black text-[10px] uppercase tracking-widest">Medical Validation Layer</p>
                  <p className="text-teal-600 text-[9px] font-bold">The system will verify if input is medical and assign triage status.</p>
                </div>
              </div>

              <button disabled={loading || formData.symptoms.length < 5} type="submit" className="w-full bg-teal-600 text-white font-black py-5 rounded-3xl mt-4 shadow-2xl shadow-teal-100 hover:bg-teal-700 transition-all active:scale-95 text-xl flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Analyzing Patient...
                  </>
                ) : 'Register & Rank'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
