import React from 'react';
import { useApi } from '../hooks/useApi';
import { ShieldCheck, HeartPulse, User } from 'lucide-react';

export const VictimAnalytics: React.FC = () => {
  const { data: victims, loading } = useApi('/cases/victims', []);

  // Summary calculations
  const total = victims.length;
  const policeVictimsCount = victims.filter((v: any) => v.is_police).length;
  const femaleVictimsCount = victims.filter((v: any) => v.gender === 'F').length;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-white tracking-wide">Victim Analytics</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Victim Profiles & Support Monitoring</p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Victims Registered</p>
            <h4 className="text-2xl font-bold text-white mt-1">{total}</h4>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center space-x-4">
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Police Personnel Injured/Affected</p>
            <h4 className="text-2xl font-bold text-white mt-1">{policeVictimsCount}</h4>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Female Victims Assisted</p>
            <h4 className="text-2xl font-bold text-white mt-1">{femaleVictimsCount}</h4>
          </div>
        </div>
      </div>

      {/* Victims list */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Victim Profile Registry</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="py-4 px-6">Victim Name</th>
                <th className="py-4 px-6">Age</th>
                <th className="py-4 px-6">Gender</th>
                <th className="py-4 px-6">Police Personnel?</th>
                <th className="py-4 px-6">Case Involvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">Loading victim database...</td>
                </tr>
              ) : (
                victims.map((v: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">{v.name}</td>
                    <td className="py-4 px-6">{v.age || 'N/A'}</td>
                    <td className="py-4 px-6 text-slate-400">{v.gender}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        v.is_police ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {v.is_police ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-semibold">{v.firs_count} cases</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
