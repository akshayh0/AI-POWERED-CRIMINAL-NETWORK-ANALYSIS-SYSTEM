import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { Link } from 'react-router-dom';
import { UserX, ShieldAlert, Award, Calendar, Landmark, Eye, Share2 } from 'lucide-react';

export const AccusedAnalytics: React.FC = () => {
  const [selectedAccused, setSelectedAccused] = useState<string | null>(null);

  // Fetch accused profiles list
  const { data: accusedList, loading: listLoading } = useApi('/cases/accused', []);

  // Fetch selected accused details
  const { data: details, loading: detailsLoading } = useApi(
    selectedAccused ? `/cases/accused/${selectedAccused}` : '', 
    null, 
    [selectedAccused]
  );

  // Summary statistics
  const total = accusedList.length;
  const highRiskCount = accusedList.filter((a: any) => a.repeat_score > 60).length;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-white tracking-wide">Accused & Repeat Offender Analytics</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Criminal Profiling & Repeat Offender Risk Scoring</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 flex items-center space-x-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Suspect Database Total</p>
            <h4 className="text-2xl font-bold text-white mt-1">{total} profiles</h4>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center space-x-4 border-rose-500/20">
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">High Risk Repeat Offenders Flagged</p>
            <h4 className="text-2xl font-bold text-orange-500 mt-1">{highRiskCount} suspects</h4>
          </div>
        </div>
      </div>

      {/* Split details layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Table List) */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Suspect Profile Registry</h3>
          <div className="overflow-y-auto max-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest sticky top-0 z-10">
                  <th className="py-4 px-4">Accused ID</th>
                  <th className="py-4 px-4">Name</th>
                  <th className="py-4 px-4">Cases</th>
                  <th className="py-4 px-4">Arrests</th>
                  <th className="py-4 px-4">Repeat Score</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {listLoading ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">Loading registry...</td>
                  </tr>
                ) : (
                  accusedList.map((acc: any) => (
                    <tr 
                      key={acc.person_id} 
                      className={`hover:bg-white/5 cursor-pointer transition-colors ${
                        selectedAccused === acc.person_id ? 'bg-blue-600/10' : ''
                      }`}
                      onClick={() => setSelectedAccused(acc.person_id)}
                    >
                      <td className="py-4 px-4 font-bold text-blue-400">{acc.person_id}</td>
                      <td className="py-4 px-4 font-bold text-white">{acc.name}</td>
                      <td className="py-4 px-4 text-slate-400">{acc.firs_count} cases</td>
                      <td className="py-4 px-4 text-slate-400">{acc.arrests_count} times</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                          acc.repeat_score > 60 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          Score: {acc.repeat_score}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedAccused(acc.person_id); }}
                          className="bg-blue-500/10 hover:bg-blue-500/30 text-blue-400 px-2 py-1 rounded text-[10px] border border-blue-500/20"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (Accused Details) */}
        <div>
          {!selectedAccused ? (
            <div className="glass-card p-8 text-center text-slate-500 text-xs">
              <ShieldAlert className="w-8 h-8 mx-auto mb-3 text-slate-600" />
              <span>Select an offender profile from the registry to view investigation details, case links, and history.</span>
            </div>
          ) : detailsLoading || !details ? (
            <div className="glass-card p-8 text-center text-slate-500 text-xs">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping mr-2 inline-block"></span>
              <span>Loading details...</span>
            </div>
          ) : (
            <div className="glass-card p-6 space-y-6">
              
              {/* Profile Card */}
              <div className="text-center border-b border-white/10 pb-4">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-rose-500/30 flex items-center justify-center text-rose-500 font-extrabold text-lg mx-auto mb-3">
                  {details.person_id}
                </div>
                <h3 className="font-bold text-white text-base leading-tight">{details.name}</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Age: {details.age} · Gender: {details.gender}</p>
                <div className="mt-4 flex justify-center space-x-2">
                  <Link
                    to={`/network?accused_id=${details.person_id}`}
                    className="inline-flex items-center space-x-1.5 bg-orange-600/20 border border-orange-500/30 text-orange-400 hover:bg-orange-600 hover:text-white px-3 py-1.5 rounded text-[10px] font-bold transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Visualize Links</span>
                  </Link>
                </div>
              </div>

              {/* Case History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Associated Cases ({details.cases.length})</span>
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {details.cases.map((c: any) => (
                    <div key={c.id} className="p-2.5 bg-slate-900/60 rounded border border-white/5 space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <Link to={`/cases/${c.id}`} className="font-bold text-blue-400 hover:underline">{c.crime_no}</Link>
                        <span className="text-slate-500">{c.registered_date}</span>
                      </div>
                      <p className="text-[9px] text-slate-400 truncate">{c.major_head} · {c.station}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrests History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Landmark className="w-4 h-4 text-rose-500" />
                  <span>Arrest Registry ({details.arrests.length})</span>
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {details.arrests.length === 0 ? (
                    <p className="text-[10px] text-slate-500">No official arrest logs found.</p>
                  ) : (
                    details.arrests.map((a: any) => (
                      <div key={a.id} className="p-2.5 bg-slate-900/60 rounded border border-white/5 text-[10px]">
                        <p className="font-semibold text-white">Arrest Date: {a.date}</p>
                        <p className="text-slate-500 mt-0.5">{a.station} ({a.district})</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
