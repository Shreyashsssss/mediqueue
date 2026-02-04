
import React, { useState, useEffect } from 'react';
import { User, Appointment, TriageLevel } from '../types';
import { clinicStore } from '../store';
import { MOCK_DOCTORS } from '../constants';
import { analyzeTriage } from '../services/geminiService';
import { Users, Clock, CheckCircle2, Calendar, User as UserIcon, LogOut, ChevronRight, AlertTriangle, Zap, Info, ShieldCheck, Sparkles, Loader2, BrainCircuit, ShieldAlert, Activity } from 'lucide-react';

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ user, onLogout }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(clinicStore.getAppointments());
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiJustification, setAiJustification] = useState<string | null>(null);
  const [isInputValid, setIsInputValid] = useState<boolean>(true);

  const [formData, setFormData] = useState({
    age: 25,
    gender: 'Select',
    phone: '',
    symptoms: '',
    urgency: 2,
    triageChoice: TriageLevel.NORMAL,
    doctorId: MOCK_DOCTORS[0].id,
    timeSlot: '10:00'
  });

  const userApp = appointments.find(a => a.patientId === user.id);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (formData.symptoms.trim().length > 5) {
        setAiAnalyzing(true);
        const result = await analyzeTriage(formData.symptoms);
        if (result) {
          if (!result.isValid) {
            setIsInputValid(false);
            setAiJustification("The entered text does not appear to describe valid medical symptoms. Please provide a description of your condition.");
          } else {
            setIsInputValid(true);
            setFormData(prev => ({
              ...prev,
              urgency: result.urgencyScale || 2,
              triageChoice: result.level || TriageLevel.NORMAL
            }));
            setAiJustification(result.justification || null);
          }
        }
        setAiAnalyzing(false);
      } else {
        setAiJustification(null);
        setIsInputValid(true);
      }
    }, 1200);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.symptoms]);

  // Fetch data on mount and interval
  useEffect(() => {
    const loadData = async () => {
      await clinicStore.refreshAppointments();
      setAppointments(clinicStore.getAppointments());
    };
    loadData();
    const interval = setInterval(loadData, 5000); // Poll every 5s for queue updates
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isInputValid) return;
    setLoading(true);

    const triageResult = await analyzeTriage(formData.symptoms);
    const finalLevel = triageResult?.isValid ? (triageResult.level as TriageLevel) : formData.triageChoice;
    const finalScore = triageResult?.isValid ? triageResult.score : (formData.urgency * 10);

    clinicStore.addAppointment({
      patientId: user.id,
      patientName: user.name,
      age: formData.age,
      gender: formData.gender,
      phone: formData.phone,
      symptoms: formData.symptoms,
      urgencyScale: formData.urgency,
      triageLevel: finalLevel,
      triageScore: finalScore,
      timeSlot: formData.timeSlot,
      doctorId: formData.doctorId,
      isOffline: false
    });

    setAppointments(clinicStore.getAppointments());
    setLoading(false);
  };

  const totalInQueue = appointments.length;
  const avgWaitTime = totalInQueue * 12;
  const sortedApps = clinicStore.getSortedAppointments();
  const myQueuePosition = userApp ? sortedApps.findIndex(a => a.id === userApp.id) + 1 : '-';

  return (
    <div className="min-h-screen bg-[#f0f9f9]">
      <nav className="bg-white border-b border-teal-50 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-100">
            <UserIcon size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">Welcome, {user.name}</h1>
            <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest">Patient Portal</p>
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all border border-slate-200">
          <LogOut size={18} />
          Logout
        </button>
      </nav>

      <main className="p-8 max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[32px] border-b-4 border-teal-500 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Current Queue</p>
              <p className="text-5xl font-black text-slate-800">{totalInQueue}</p>
            </div>
            <div className="bg-teal-50 p-4 rounded-2xl text-teal-500">
              <Users size={32} />
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] border-b-4 border-cyan-500 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Est. Wait Time</p>
              <p className="text-5xl font-black text-slate-800">{avgWaitTime}</p>
            </div>
            <div className="bg-cyan-50 p-4 rounded-2xl text-cyan-500">
              <Clock size={32} />
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] border-b-4 border-emerald-500 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Your Position</p>
              <p className="text-5xl font-black text-slate-800">{myQueuePosition}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-500">
              <CheckCircle2 size={32} />
            </div>
          </div>
        </div>

        {userApp ? (
          <div className="bg-white p-12 rounded-[48px] shadow-2xl border border-teal-50 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10">
              <div className="bg-teal-50 text-teal-600 px-6 py-2.5 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-2 border border-teal-100">
                <ShieldCheck size={18} /> Confirmed
              </div>
            </div>
            <h2 className="text-4xl font-black text-slate-800 mb-2">Appointment Scheduled</h2>
            <p className="text-slate-400 mb-10 font-bold text-lg">Please arrive at the clinic 15 minutes prior.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                {[
                  { label: 'Priority Status', value: userApp.triageLevel, isBadge: true },
                  { label: 'Assigned Doctor', value: MOCK_DOCTORS.find(d => d.id === userApp.doctorId)?.name },
                  { label: 'Time Slot', value: userApp.timeSlot }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-teal-50/20 rounded-2xl border border-teal-50">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">{item.label}</span>
                    {item.isBadge ? (
                      <span className={`font-black px-5 py-1.5 rounded-xl text-xs uppercase tracking-widest ${userApp.triageLevel === TriageLevel.EMERGENCY ? 'bg-black text-white ring-2 ring-red-500' :
                          userApp.triageLevel === TriageLevel.CRITICAL ? 'bg-red-600 text-white' :
                            userApp.triageLevel === TriageLevel.INTERMEDIATE ? 'bg-orange-500 text-white' :
                              'bg-teal-600 text-white'}`}>
                        {item.value}
                      </span>
                    ) : (
                      <span className="font-black text-slate-800">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-br from-teal-600 to-cyan-700 p-10 rounded-[40px] text-white shadow-xl flex flex-col justify-between">
                <div>
                  <h4 className="text-2xl font-black mb-4 flex items-center gap-3"><Zap size={24} strokeWidth={3} /> Live Tracker</h4>
                  <p className="text-teal-50 text-sm font-medium leading-relaxed">Our clinical AI is monitoring active rooms to optimize your entry time. You will be notified via SMS when the doctor is ready.</p>
                </div>
                <div className="mt-8 text-center bg-white/10 p-6 rounded-[32px] border border-white/20 backdrop-blur-sm">
                  <p className="text-5xl font-black">{myQueuePosition}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-2">Current Global Rank</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[48px] shadow-2xl border border-teal-50">
            <div className="flex items-center gap-6 mb-12">
              <div className="bg-teal-50 p-4 rounded-3xl text-teal-600 border border-teal-100">
                <Calendar size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-800">Book New Appointment</h2>
                <p className="text-slate-400 text-lg font-bold">Automatic Triage Validation Protocol</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Age *</label>
                  <input type="number" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-bold" value={formData.age} onChange={e => setFormData({ ...formData, age: +e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Gender *</label>
                  <select className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-bold appearance-none" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                    <option>Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone *</label>
                  <input required placeholder="+1 (555) 000-0000" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-bold" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>

              <div className="space-y-4 relative">
                <div className="flex items-center justify-between mb-2 px-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Clinical Description *</label>
                  <div className="flex items-center gap-1.5 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${!isInputValid ? 'bg-red-500' : 'bg-teal-500'}`}></div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${!isInputValid ? 'text-red-700' : 'text-teal-700'}`}>
                      {!isInputValid ? 'Validation Error' : 'Gemini AI Validator'}
                    </span>
                  </div>
                </div>
                <textarea
                  required
                  placeholder="Describe your medical situation (e.g. 'Sharp chest pain radiating to left arm')..."
                  className={`w-full p-6 bg-slate-50 border rounded-3xl h-40 focus:ring-4 outline-none transition-all resize-none font-medium text-lg placeholder:text-slate-300 shadow-inner ${!isInputValid ? 'border-red-300 focus:ring-red-500/10' : 'border-slate-200 focus:ring-teal-500/10'
                    }`}
                  value={formData.symptoms}
                  onChange={e => setFormData({ ...formData, symptoms: e.target.value })}
                ></textarea>
                {!isInputValid && (
                  <div className="flex items-center gap-2 text-red-600 font-bold text-sm px-2 animate-pulse">
                    <ShieldAlert size={16} /> Please enter valid symptoms or a medical condition.
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Validated Priority Level</label>
                </div>

                {(!formData.symptoms || formData.symptoms.trim().length < 6) ? (
                  <div className="p-12 border-2 border-dashed border-slate-200 rounded-[32px] text-center bg-slate-50/30 flex flex-col items-center gap-3">
                    <BrainCircuit className="text-slate-200" size={48} />
                    <p className="text-slate-400 font-bold text-sm">Awaiting medical markers for diagnostic categorization...</p>
                  </div>
                ) : (
                  <div className={`p-10 rounded-[40px] border-2 transition-all flex flex-col items-center gap-6 relative overflow-hidden shadow-2xl ${aiAnalyzing ? 'bg-slate-50 border-slate-200' :
                      !isInputValid ? 'bg-red-50 border-red-200' :
                        formData.triageChoice === TriageLevel.EMERGENCY ? 'bg-slate-900 border-red-500' :
                          formData.triageChoice === TriageLevel.CRITICAL ? 'bg-red-50 border-red-200' :
                            formData.triageChoice === TriageLevel.INTERMEDIATE ? 'bg-orange-50 border-orange-200' :
                              'bg-teal-50 border-teal-200'
                    }`}>
                    {aiAnalyzing ? (
                      <div className="flex flex-col items-center gap-4 py-6">
                        <Loader2 className="text-teal-600 animate-spin" size={48} strokeWidth={3} />
                        <p className="text-teal-700 font-black uppercase tracking-widest text-xs">Clinical AI Validating Symptoms...</p>
                      </div>
                    ) : (
                      <>
                        <div className={`p-6 rounded-[32px] shadow-xl transition-all ${!isInputValid ? 'bg-red-100 text-red-600 shadow-none' :
                            formData.triageChoice === TriageLevel.EMERGENCY ? 'bg-red-600 text-white shadow-red-900/40 ring-4 ring-red-500/20 animate-pulse' :
                              formData.triageChoice === TriageLevel.CRITICAL ? 'bg-red-500 text-white shadow-red-200' :
                                formData.triageChoice === TriageLevel.INTERMEDIATE ? 'bg-orange-500 text-white shadow-orange-200' :
                                  'bg-teal-500 text-white shadow-teal-200'
                          }`}>
                          {!isInputValid ? <ShieldAlert size={40} /> :
                            formData.triageChoice === TriageLevel.EMERGENCY ? <Activity size={40} /> :
                              formData.triageChoice === TriageLevel.CRITICAL ? <AlertTriangle size={40} /> :
                                formData.triageChoice === TriageLevel.INTERMEDIATE ? <Zap size={40} /> : <Info size={40} />}
                        </div>
                        <div className="text-center">
                          <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${formData.triageChoice === TriageLevel.EMERGENCY ? 'text-slate-400' : 'text-slate-400'}`}>
                            {isInputValid ? 'Assigned Urgency' : 'Validation Failed'}
                          </p>
                          <h3 className={`text-4xl font-black mb-4 ${!isInputValid ? 'text-red-700' :
                              formData.triageChoice === TriageLevel.EMERGENCY ? 'text-red-500' :
                                formData.triageChoice === TriageLevel.CRITICAL ? 'text-red-600' :
                                  formData.triageChoice === TriageLevel.INTERMEDIATE ? 'text-orange-600' :
                                    'text-teal-600'
                            }`}>
                            {!isInputValid ? 'INVALID INPUT' : formData.triageChoice}
                          </h3>
                          <div className={`p-5 rounded-2xl border backdrop-blur-sm max-w-lg mx-auto ${formData.triageChoice === TriageLevel.EMERGENCY ? 'bg-white/10 border-white/10' : 'bg-white/60 border-white/40'
                            }`}>
                            <p className={`font-bold text-sm flex items-start gap-2 text-left ${formData.triageChoice === TriageLevel.EMERGENCY ? 'text-slate-200' : 'text-slate-700'
                              }`}>
                              <Sparkles className={`${formData.triageChoice === TriageLevel.EMERGENCY ? 'text-red-400' : 'text-teal-600'} shrink-0 mt-0.5`} size={16} />
                              {aiJustification}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={loading || aiAnalyzing || !isInputValid || formData.symptoms.length < 6}
                  className={`px-12 py-5 text-white font-black rounded-3xl shadow-2xl transition-all active:scale-[0.98] disabled:opacity-30 flex items-center gap-3 text-xl ${formData.triageChoice === TriageLevel.EMERGENCY ? 'bg-red-600 shadow-red-200' : 'bg-gradient-to-r from-teal-600 to-emerald-600 shadow-teal-100'
                    }`}
                >
                  {loading ? 'Submitting...' : 'Register for Appointment'}
                  <ChevronRight size={24} strokeWidth={3} />
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-10">
          <div className="flex items-center gap-6">
            <div className="bg-teal-50 p-4 rounded-3xl text-teal-600 border border-teal-100">
              <Users size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800">Available Specialists</h2>
              <p className="text-slate-400 text-lg font-bold">View doctor profiles and scheduling</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {MOCK_DOCTORS.map(doc => (
              <div key={doc.id} className="bg-white p-10 rounded-[40px] shadow-lg border border-teal-50 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute top-8 right-8 flex gap-2 items-center">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Available</span>
                </div>
                <div className="flex gap-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-[32px] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-teal-100 group-hover:scale-105 transition-transform">
                    {doc.name.charAt(4)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-3xl font-black text-slate-800">{doc.name}</h3>
                    <p className="text-teal-600 font-black tracking-tight">{doc.specialty}</p>
                    <div className="flex flex-col gap-2 pt-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-bold"><Zap size={18} className="text-amber-500" /> {doc.experience} Years Experience</div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-bold"><ShieldCheck size={18} className="text-teal-500" /> {doc.education}</div>
                      <div className="flex items-center gap-1 text-yellow-500 font-black pt-2">
                        {"★".repeat(Math.floor(doc.rating))} <span className="text-slate-400 ml-1 font-bold text-sm">{doc.rating}/5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-10 pt-10 border-t border-slate-50 flex flex-wrap gap-3 items-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">Open Slots:</span>
                  <span className="bg-teal-50 text-teal-600 px-4 py-1.5 rounded-xl text-xs font-black border border-teal-100 italic">Today</span>
                  <span className="bg-teal-50 text-teal-600 px-4 py-1.5 rounded-xl text-xs font-black border border-teal-100 italic">Tomorrow</span>
                  <span className="bg-slate-50 text-slate-400 px-4 py-1.5 rounded-xl text-xs font-black border border-slate-100 italic">Jan 25</span>
                  <button className="ml-auto px-6 py-2.5 bg-teal-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-800 transition-all">View Profile</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
