import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { 
  Shield, Calendar, Landmark, MapPin, Scale, User, Users, Clock, 
  BrainCircuit, FileText 
} from 'lucide-react';

export const CaseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch case details
  const { data: c, loading, error } = useApi(`/cases/${id}`, null, [id]);

  // Fetch similar cases (AI MO comparison)
  const { data: similarCases } = useApi(`/ai/similar-cases/${id}`, [], [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 space-x-2">
        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></span>
        <span className="text-slate-400 text-xs font-semibold">Retrieving case files from KSP database...</span>
      </div>
    );
  }

  if (error || !c) {
    return (
      <div className="glass-card p-8 text-center text-rose-400">
        <p className="text-sm font-bold">Case record not found or server error.</p>
        <Link to="/firs" className="text-xs text-blue-400 hover:text-white mt-4 inline-block font-bold">&larr; Back to FIR Register</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button and page title */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/firs" className="text-xs text-blue-400 hover:text-white font-bold transition-colors">&larr; BACK TO FIR REGISTRY</Link>
          <h1 className="text-2xl font-bold font-heading text-white tracking-wide mt-2">
            Crime Number: <span className="text-orange-500">{c.crime_no}</span>
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Official Karnataka Police Case Docket</p>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded text-xs font-bold ${
            c.status === 'Under Investigation' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
            c.status === 'Charge Sheeted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
            'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>
            Status: {c.status}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Case Facts & Details) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* General Metadata */}
          <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-500">Registered Date</p>
                <p className="text-xs font-semibold text-white">{c.registered_date}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Landmark className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-500">Police Station Limits</p>
                <p className="text-xs font-semibold text-white">{c.station}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-500">Investigating Officer</p>
                <p className="text-xs font-semibold text-white">{c.officer?.name} ({c.officer?.rank})</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Scale className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-500">Trial Court Jurisdiction</p>
                <p className="text-xs font-semibold text-white">{c.court}</p>
              </div>
            </div>
          </div>

          {/* Occurrence details & Brief Facts */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10">Incident Occurrence Facts</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-500">Incident Start</p>
                <p className="font-semibold text-slate-300">{c.occurrence.from_date}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-500">Incident End</p>
                <p className="font-semibold text-slate-300">{c.occurrence.to_date}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-500">Information Received at PS</p>
                <p className="font-semibold text-slate-300">{c.occurrence.received_date}</p>
              </div>
            </div>

            {c.occurrence.latitude && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>GPS Coordinates: {c.occurrence.latitude}° N, {c.occurrence.longitude}° E</span>
              </div>
            )}

            <div className="space-y-1.5 pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Brief Facts of the Case</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-lg border border-white/5">
                {c.occurrence.brief_facts}
              </p>
            </div>
          </div>

          {/* People involved */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Accused details */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10 mb-3 flex items-center space-x-2">
                <User className="w-4.5 h-4.5 text-rose-400" />
                <span>Accused details</span>
              </h3>
              <div className="space-y-3">
                {c.accused.map((acc: any) => (
                  <div key={acc.id} className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded border border-white/5">
                    <div>
                      <Link to={`/accused/${acc.person_id}`} className="text-xs font-bold text-white hover:text-blue-400 transition-colors">
                        {acc.name}
                      </Link>
                      <p className="text-[10px] text-slate-500">Age: {acc.age} · Gender: {acc.gender}</p>
                    </div>
                    <span className="text-[9px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/20 font-bold uppercase tracking-wider">
                      {acc.sort_order}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Victims details */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10 mb-3 flex items-center space-x-2">
                <Users className="w-4.5 h-4.5 text-emerald-400" />
                <span>Victim details</span>
              </h3>
              <div className="space-y-3">
                {c.victims.map((vic: any) => (
                  <div key={vic.id} className="bg-slate-900/50 p-2.5 rounded border border-white/5 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-white">{vic.name}</p>
                      <p className="text-[10px] text-slate-500">Age: {vic.age} · Gender: {vic.gender}</p>
                    </div>
                    {vic.is_police && (
                      <span className="text-[9px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded border border-blue-500/25 font-bold uppercase tracking-widest">
                        KSP OFFICER
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Sidebar Column (Act-Sections & AI MO Matches) */}
        <div className="space-y-8">
          
          {/* Act and Sections Invoked */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10 mb-4">Legal Charges Invoked</h3>
            <div className="space-y-3">
              {c.act_sections.map((as: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-950/60 rounded-lg border border-white/5">
                  <span className="text-[9px] bg-blue-600/20 text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest">
                    {as.act}
                  </span>
                  <p className="text-sm font-extrabold text-white mt-1.5">Section {as.section}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Investigation Timeline */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10 mb-4 flex items-center space-x-2">
              <Clock className="w-4.5 h-4.5 text-blue-500" />
              <span>Case Timeline</span>
            </h3>
            <div className="relative border-l border-white/10 ml-2.5 pl-4 space-y-5">
              <div className="relative">
                <span className="absolute -left-[21.5px] top-0.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-950"></span>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Registered</p>
                <p className="text-xs text-white font-medium">{c.registered_date}</p>
              </div>
              {c.chargesheets.map((cs: any) => (
                <div key={cs.id} className="relative">
                  <span className="absolute -left-[21.5px] top-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse"></span>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{cs.type}</p>
                  <p className="text-xs text-white font-medium">{cs.date.split(' ')[0]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Similar Cases Recommendations */}
          <div className="glass-card p-6 border-blue-500/20">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white pb-2 border-b border-white/10 mb-4 flex items-center space-x-2">
              <BrainCircuit className="w-4.5 h-4.5 text-blue-400 animate-pulse" />
              <span>AI Modus Operandi Matches</span>
            </h3>
            <div className="space-y-4">
              {similarCases.length === 0 ? (
                <p className="text-xs text-slate-500">No matching patterns found in this district's history.</p>
              ) : (
                similarCases.map((sc: any) => (
                  <div key={sc.case_id} className="p-3 bg-slate-900/60 rounded border border-white/5 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Link to={`/cases/${sc.case_id}`} className="text-xs font-bold text-blue-400 hover:text-white transition-colors">
                        FIR: {sc.crime_no}
                      </Link>
                      <span className="text-[9px] bg-blue-500/10 text-blue-400 font-bold px-1.5 py-0.5 rounded border border-blue-500/20">
                        {sc.similarity_score}% Similar
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {sc.brief_facts}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
