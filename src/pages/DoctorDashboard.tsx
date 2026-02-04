
import React, { useMemo, useEffect } from 'react';
import { User, Appointment, TriageLevel } from '../types';
import { clinicStore } from '../store';
import { MOCK_DOCTORS } from '../constants';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie
} from 'recharts';
import {
  ShieldCheck,
  LogOut,
  AlertTriangle,
  Zap,
  Info,
  BarChart3,
  Users,
  Clock,
  Activity,
  TrendingUp,
  ShieldAlert,
  UserCheck,
  CalendarDays,
  BriefcaseMedical,
  Stethoscope
} from 'lucide-react';

interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ user, onLogout }) => {
  const [appointments, setAppointments] = React.useState<Appointment[]>(clinicStore.getAppointments());

  useEffect(() => {
    const loadData = async () => {
      await clinicStore.refreshAppointments();
      setAppointments(clinicStore.getAppointments());
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Metrics calculation
  const metrics = useMemo(() => {
    const counts = {
      [TriageLevel.EMERGENCY]: appointments.filter(a => a.triageLevel === TriageLevel.EMERGENCY).length,
      [TriageLevel.CRITICAL]: appointments.filter(a => a.triageLevel === TriageLevel.CRITICAL).length,
      [TriageLevel.INTERMEDIATE]: appointments.filter(a => a.triageLevel === TriageLevel.INTERMEDIATE).length,
      [TriageLevel.NORMAL]: appointments.filter(a => a.triageLevel === TriageLevel.NORMAL).length,
    };

    const isVolumeOverloaded = appointments.length >= 10;
    const isResourceStrained = (counts[TriageLevel.EMERGENCY] + counts[TriageLevel.CRITICAL]) >= 5;
    const isOvercrowded = isVolumeOverloaded || isResourceStrained;

    return { counts, isOvercrowded, isVolumeOverloaded, isResourceStrained };
  }, [appointments]);

  // Analytics Data
  const triageData = useMemo(() => [
    { name: 'Emergency', value: metrics.counts[TriageLevel.EMERGENCY], color: '#0f172a' },
    { name: 'Critical', value: metrics.counts[TriageLevel.CRITICAL], color: '#ef4444' },
    { name: 'Intermediate', value: metrics.counts[TriageLevel.INTERMEDIATE], color: '#f97316' },
    { name: 'Normal', value: metrics.counts[TriageLevel.NORMAL], color: '#14b8a6' },
  ], [metrics.counts]);

  const hourlyFlowData = [
    { hour: '08:00', patients: 4 },
    { hour: '10:00', patients: 12 },
    { hour: '12:00', patients: 8 },
    { hour: '14:00', patients: 15 },
    { hour: '16:00', patients: 9 },
    { hour: '18:00', patients: 5 },
    { hour: '20:00', patients: 2 },
  ];

  const staffDistribution = [
    { name: 'Doctors', value: 8, color: '#0d9488' },
    { name: 'Nurses', value: 24, color: '#14b8a6' },
    { name: 'Technicians', value: 12, color: '#0891b2' },
    { name: 'Admin Staff', value: 6, color: '#64748b' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md border border-slate-100 p-4 rounded-2xl shadow-xl">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{label || payload[0].name}</p>
          <p className="text-xl font-black text-slate-800">{payload[0].value} <span className="text-xs font-bold text-slate-400 uppercase">Count</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#f0f9f9]">
      <nav className="bg-white border-b border-teal-50 px-8 py-5 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-800 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-100">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Head Doctor Dashboard</h1>
            <p className="text-xs text-teal-600 font-black uppercase tracking-widest">Clinical Administration & Analytics</p>
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all border border-slate-200">
          <LogOut size={18} />
          Logout
        </button>
      </nav>

      <main className="p-8 max-w-7xl mx-auto space-y-10">
        {/* Automated Overcrowding Alert */}
        {metrics.isOvercrowded && (
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-10 rounded-[40px] shadow-2xl shadow-red-200 flex items-center gap-8 relative overflow-hidden group border-4 border-red-400">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10 animate-pulse">
              <ShieldAlert size={240} />
            </div>
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/30 shrink-0">
              <AlertTriangle size={40} className="animate-bounce" />
            </div>
            <div className="flex-1">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Overcrowding is happening</h2>
              <p className="text-red-100 font-bold text-lg max-w-2xl leading-relaxed">
                {metrics.isVolumeOverloaded ? "Total patient volume has exceeded clinical capacity thresholds. " : ""}
                {metrics.isResourceStrained ? "High-urgency case concentration is creating critical bottlenecks." : ""}
                <br />
                <span className="opacity-80 text-sm">Automated protocol: Redirect non-emergency walk-ins and activate backup staff.</span>
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button className="px-10 py-5 bg-white text-red-700 font-black rounded-3xl hover:bg-red-50 transition-all shadow-2xl active:scale-95 text-lg">Deploy Backup Staff</button>
            </div>
          </div>
        )}

        {/* Global Performance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-teal-50 flex items-center justify-between group hover:shadow-lg transition-all">
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Patients This Week</p>
              <p className="text-4xl font-black text-slate-800">482</p>
              <div className="flex items-center gap-1 text-emerald-500 font-black text-[10px] uppercase">
                <TrendingUp size={12} /> +12.5% vs Prev.
              </div>
            </div>
            <div className="bg-teal-50 p-4 rounded-2xl text-teal-600">
              <CalendarDays size={28} />
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-teal-50 flex items-center justify-between group hover:shadow-lg transition-all">
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Active Queue</p>
              <p className="text-4xl font-black text-slate-800">{appointments.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Live Processing</p>
            </div>
            <div className="bg-cyan-50 p-4 rounded-2xl text-cyan-600">
              <Users size={28} />
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-teal-50 flex items-center justify-between group hover:shadow-lg transition-all">
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Staff On-Duty</p>
              <p className="text-4xl font-black text-slate-800">50</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Across 4 Roles</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600">
              <UserCheck size={28} />
            </div>
          </div>
          <div className="bg-slate-900 p-8 rounded-[32px] shadow-xl text-white flex items-center justify-between group hover:scale-[1.02] transition-all">
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Avg Room Time</p>
              <p className="text-4xl font-black text-white">22m</p>
              <p className="text-[10px] font-bold text-teal-400 uppercase">Target: 20m</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl text-teal-400">
              <Clock size={28} />
            </div>
          </div>
        </div>

        {/* Analytics Section 1: Clinical Triage & Hourly Traffic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white p-10 rounded-[48px] shadow-xl border border-teal-50">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-teal-50 p-3 rounded-2xl text-teal-600">
                <BarChart3 size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800">Triage Distribution</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Urgency Segmentation</p>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={triageData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 900 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                    {triageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[48px] shadow-xl border border-teal-50">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-cyan-50 p-3 rounded-2xl text-cyan-600">
                <Activity size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800">Hourly Patient Flow</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Today's Traffic Pattern</p>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyFlowData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="hour"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 900 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="patients"
                    stroke="#0d9488"
                    strokeWidth={4}
                    dot={{ fill: '#0d9488', r: 6, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Analytics Section 2: Workforce Distribution & Specialists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 bg-white p-10 rounded-[48px] shadow-xl border border-teal-50">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                <BriefcaseMedical size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800">Workforce</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Staff Role Distribution</p>
              </div>
            </div>

            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={staffDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {staffDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Label for Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-2xl font-black text-slate-800">50</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Staff</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {staffDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-10 rounded-[48px] shadow-xl border border-teal-50">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-teal-50 p-3 rounded-2xl text-teal-600">
                  <Stethoscope size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">On-Call Specialists</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Active Clinical Directory</p>
                </div>
              </div>
              <button className="text-teal-600 font-black text-xs uppercase hover:underline">Manage Schedules</button>
            </div>

            <div className="space-y-4">
              {MOCK_DOCTORS.map(doc => (
                <div key={doc.id} className="p-5 bg-slate-50 border border-slate-100 rounded-[28px] flex items-center gap-6 hover:bg-white hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white font-black text-lg">
                    {doc.name.charAt(4)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-800">{doc.name}</h4>
                    <p className="text-[10px] font-bold text-teal-600 uppercase tracking-tighter">{doc.specialty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Availability</p>
                    <span className="text-xs font-black text-emerald-600">Full Access</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
